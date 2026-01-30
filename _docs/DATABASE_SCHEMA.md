# Database Schema

## Overview

The database consists of three main tables: Users, Photos, and Collections. The schema is designed to support both mock (in-memory) and PostgreSQL implementations through the DataProvider interface.

## Tables

### Users Table

Stores user account information and Dropbox OAuth credentials.

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  dropbox_access_token TEXT,
  dropbox_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field Descriptions:**
- `user_id`: Unique identifier (UUID)
- `email`: User's email address (unique, required)
- `name`: User's display name
- `dropbox_access_token`: OAuth access token for Dropbox API
- `dropbox_refresh_token`: OAuth refresh token for token renewal
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Photos Table

Stores photo metadata and references to Dropbox files. Actual photos are not stored; only metadata and URLs.

```sql
CREATE TABLE photos (
  photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  dropbox_file_id VARCHAR(255),
  dropbox_url TEXT,
  dropbox_metadata JSONB,
  hash VARCHAR(64),
  file_size BIGINT,
  source TEXT[] DEFAULT '{}',
  INDEX idx_owner (owner_id),
  INDEX idx_tags (tags),
  INDEX idx_hash (hash)
);
```

**Field Descriptions:**
- `photo_id`: Unique identifier (UUID)
- `owner_id`: Foreign key to users table
- `tags`: Array of tag strings (e.g., ['family', 'vacation', '2024'])
- `created_at`: Photo creation timestamp in our system
- `updated_at`: Last update timestamp
- `dropbox_file_id`: Dropbox file identifier (e.g., 'id:abc123...')
- `dropbox_url`: Direct URL to photo in Dropbox
- `dropbox_metadata`: JSONB field for flexible Dropbox metadata
  - `name`: Original filename
  - `size`: File size in bytes
  - `client_modified`: Client modification timestamp
  - `content_hash`: Dropbox content hash
  - Custom fields as needed
- `hash`: SHA256 hash for duplicate detection
- `file_size`: File size in bytes (denormalized for quick access)
- `source`: Array of storage provider names where photo exists (e.g., ['Dropbox', 'Google Photos', 'iCloud'])

**Indexes:**
- `idx_owner`: Fast lookup by owner
- `idx_tags`: GIN index for tag array queries
- `idx_hash`: Fast duplicate detection

#### Source Tracking

The `source` field enables cross-provider duplicate detection and reconciliation:

- **Single-source photo**: `["Dropbox"]` - Photo exists in only one storage provider
- **Cross-provider duplicate**: `["Dropbox", "Google Photos", "iCloud"]` - Same photo exists in multiple providers
- **Use cases**:
  - Identify photos that were uploaded to multiple cloud services
  - Prevent duplicate storage across providers
  - Show users where their photos are stored
  - Enable smart sync and deduplication across providers

**Query examples:**
```sql
-- Find photos that exist in multiple providers
SELECT * FROM photos WHERE array_length(source, 1) > 1;

-- Find photos from specific provider
SELECT * FROM photos WHERE 'Dropbox' = ANY(source);

-- Find cross-provider duplicates (same hash, multiple sources)
SELECT hash, array_agg(source) as all_sources, COUNT(*)
FROM photos
GROUP BY hash
HAVING COUNT(*) > 1;
```

**Future enhancements:**
- Source-aware sync logic when connecting multiple providers
- Cross-provider duplicate grouping in /duplicates page
- Provider badges in PhotoCard UI ("Also in Google Photos")

### Collections Table

Stores collections of photos. Same entity serves as both "albums" (organizer view) and "scrapbooks" (print view).

```sql
CREATE TABLE collections (
  collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  photo_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  type VARCHAR(20) DEFAULT 'album',
  INDEX idx_user (user_id),
  INDEX idx_type (type)
);
```

**Field Descriptions:**
- `collection_id`: Unique identifier (UUID)
- `user_id`: Foreign key to users table
- `name`: Collection name (e.g., "Summer Vacation 2024")
- `photo_ids`: Array of photo UUIDs in this collection
- `tags`: Array of collection-level tags
- `created_at`: Collection creation timestamp
- `updated_at`: Last update timestamp
- `type`: UI context ('album' or 'scrapbook')
  - Both use same entity, different UI rendering
  - 'album': Photo grid layout with drag-drop
  - 'scrapbook': Print-friendly layout

**Indexes:**
- `idx_user`: Fast lookup by user
- `idx_type`: Fast filtering by type

### Duplicate Groups Table (Optional)

For tracking duplicate detection results and resolution status.

```sql
CREATE TABLE duplicate_groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash VARCHAR(64) NOT NULL,
  photo_ids UUID[] NOT NULL,
  match_type VARCHAR(20) DEFAULT 'exact',
  resolved BOOLEAN DEFAULT FALSE,
  keeper_photo_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Field Descriptions:**
- `group_id`: Unique identifier (UUID)
- `hash`: Hash value that identifies duplicates
- `photo_ids`: Array of photo UUIDs that are duplicates
- `match_type`: 'exact' (hash match) or 'visual' (perceptual hash)
- `resolved`: Whether user has addressed this duplicate group
- `keeper_photo_id`: Photo chosen to keep (others moved/deleted)
- `created_at`: When duplicate group was detected

## Relationships

```
users (1) ──< (many) photos
  └─────────< (many) collections

collections (many) ─< (many) photos
  (via photo_ids array)
```

**Cascade Behavior:**
- Delete user → Delete all their photos and collections
- Delete photo → Should remove from collection.photo_ids arrays

## PostgreSQL-Specific Features

### Array Columns

- `tags TEXT[]`: Supports multiple tags per photo/collection
- `photo_ids UUID[]`: Stores collection membership
- Query example:
  ```sql
  -- Find photos with 'family' tag
  SELECT * FROM photos WHERE 'family' = ANY(tags);

  -- Find collections containing specific photo
  SELECT * FROM collections WHERE 'photo-uuid' = ANY(photo_ids);
  ```

### JSONB Column

- `dropbox_metadata JSONB`: Flexible metadata storage
- Query example:
  ```sql
  -- Find photos with specific metadata
  SELECT * FROM photos WHERE dropbox_metadata->>'name' LIKE '%.jpg';

  -- Update nested metadata
  UPDATE photos SET dropbox_metadata = jsonb_set(
    dropbox_metadata,
    '{moved_to_duplicates}',
    'true'::jsonb
  ) WHERE photo_id = 'uuid';
  ```

## Index Strategy

**Performance Considerations:**
- `owner_id` index: Fast photo retrieval per user
- `user_id` index: Fast collection retrieval per user
- `tags` GIN index: Efficient tag-based filtering
- `hash` index: Fast duplicate detection queries

**Trade-offs:**
- Array storage for `photo_ids` is simple but may need refactoring to junction table at scale
- Current design optimizes for read performance (user viewing photos)
- Write performance acceptable for typical user workload

## Migration Path

### Phase 1-5: Mock Provider
```typescript
// In-memory arrays simulate database
private photos: Photo[] = [...];
private collections: Collection[] = [...];
private users: User[] = [...];
```

### Phase 6+: PostgreSQL Provider
```typescript
// Real database queries
async getPhotos(userId: string): Promise<Photo[]> {
  const { rows } = await db.query(
    'SELECT * FROM photos WHERE owner_id = $1',
    [userId]
  );
  return rows;
}
```

**Migration Script:** `/migrations/001_initial_schema.sql`

Run migration:
```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

## Data Integrity

**Invariants:**
- `photo_id` and `collection_id` never change once created
- `photo_ids` array contains only valid photo UUIDs (enforce with app logic)
- `owner_id` / `user_id` always reference valid users (enforced by FK)

**Cleanup Tasks:**
- Periodic check for orphaned `photo_ids` in collections
- Token refresh for expired Dropbox credentials
- Hash recomputation if detection logic changes
