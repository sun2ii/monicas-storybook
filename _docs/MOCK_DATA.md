# Mock Data Structure

## Overview

Mock data is stored in JSON files under `/src/mocks/` directory. This data is used during Phase 1-5 before migrating to PostgreSQL in Phase 6.

## File Locations

```
src/mocks/
├── photos.json       # Photo metadata and Dropbox references
├── collections.json  # User collections/albums
└── users.json        # User accounts
```

---

## photos.json

**Purpose:** Sample photo data with metadata

**Location:** `/src/mocks/photos.json`

### Structure

```json
[
  {
    "photo_id": "string (UUID)",
    "tags": ["array", "of", "strings"],
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp",
    "owner_id": "string (UUID)",
    "dropbox_file_id": "string",
    "dropbox_url": "string (URL)",
    "dropbox_metadata": {
      "name": "string",
      "size": "number (bytes)",
      "client_modified": "ISO 8601 timestamp"
    },
    "hash": "string (SHA256)",
    "file_size": "number (bytes)"
  }
]
```

### Complete Example

```json
[
  {
    "photo_id": "photo-001",
    "tags": ["family", "2024", "birthday"],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "owner_id": "user-001",
    "dropbox_file_id": "id:mock-dropbox-file-1",
    "dropbox_url": "https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Photo+1",
    "dropbox_metadata": {
      "name": "IMG_001.jpg",
      "size": 2048000,
      "client_modified": "2024-01-15T10:00:00Z"
    },
    "hash": "abc123duplicatehash",
    "file_size": 2048000
  },
  {
    "photo_id": "photo-002",
    "tags": ["family", "2024", "birthday"],
    "created_at": "2024-01-15T10:31:00Z",
    "updated_at": "2024-01-15T10:31:00Z",
    "owner_id": "user-001",
    "dropbox_file_id": "id:mock-dropbox-file-2",
    "dropbox_url": "https://via.placeholder.com/800x600/4ECDC4/ffffff?text=Photo+2+Duplicate",
    "dropbox_metadata": {
      "name": "IMG_001_copy.jpg",
      "size": 2048000,
      "client_modified": "2024-01-15T10:00:00Z"
    },
    "hash": "abc123duplicatehash",
    "file_size": 2048000
  },
  {
    "photo_id": "photo-003",
    "tags": ["vacation", "2024", "beach"],
    "created_at": "2024-06-20T14:22:00Z",
    "updated_at": "2024-06-20T14:22:00Z",
    "owner_id": "user-001",
    "dropbox_file_id": "id:mock-dropbox-file-3",
    "dropbox_url": "https://via.placeholder.com/800x600/95E1D3/ffffff?text=Beach+Photo",
    "dropbox_metadata": {
      "name": "Beach_Sunset.jpg",
      "size": 3145728,
      "client_modified": "2024-06-20T14:00:00Z"
    },
    "hash": "xyz789uniquehash",
    "file_size": 3145728
  },
  {
    "photo_id": "photo-004",
    "tags": ["family", "2024", "christmas"],
    "created_at": "2024-12-25T09:15:00Z",
    "updated_at": "2024-12-25T09:15:00Z",
    "owner_id": "user-001",
    "dropbox_file_id": "id:mock-dropbox-file-4",
    "dropbox_url": "https://via.placeholder.com/800x600/F38181/ffffff?text=Christmas",
    "dropbox_metadata": {
      "name": "Christmas_Morning.jpg",
      "size": 2621440,
      "client_modified": "2024-12-25T09:00:00Z"
    },
    "hash": "def456uniquehash",
    "file_size": 2621440
  }
]
```

### Duplicate Photo Examples

**Important:** Include at least 2 photos with the same hash to test duplicate detection.

```json
[
  {
    "photo_id": "photo-001",
    "hash": "abc123duplicatehash",
    ...
  },
  {
    "photo_id": "photo-002",
    "hash": "abc123duplicatehash",
    ...
  }
]
```

These two photos will be detected as exact duplicates in Phase 3.

---

## collections.json

**Purpose:** Sample collections/albums

**Location:** `/src/mocks/collections.json`

### Structure

```json
[
  {
    "collection_id": "string (UUID)",
    "user_id": "string (UUID)",
    "name": "string",
    "photo_ids": ["array", "of", "photo", "UUIDs"],
    "tags": ["array", "of", "strings"],
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp",
    "type": "album | scrapbook"
  }
]
```

### Complete Example

```json
[
  {
    "collection_id": "coll-001",
    "user_id": "user-001",
    "name": "Birthday Party 2024",
    "photo_ids": ["photo-001", "photo-002"],
    "tags": ["birthday", "2024"],
    "created_at": "2024-01-16T12:00:00Z",
    "updated_at": "2024-01-16T12:00:00Z",
    "type": "album"
  },
  {
    "collection_id": "coll-002",
    "user_id": "user-001",
    "name": "Summer Vacation",
    "photo_ids": ["photo-003"],
    "tags": ["vacation", "2024", "summer"],
    "created_at": "2024-06-21T08:30:00Z",
    "updated_at": "2024-06-21T08:30:00Z",
    "type": "album"
  },
  {
    "collection_id": "coll-003",
    "user_id": "user-001",
    "name": "Holiday Scrapbook",
    "photo_ids": ["photo-004"],
    "tags": ["christmas", "2024"],
    "created_at": "2024-12-26T10:00:00Z",
    "updated_at": "2024-12-26T10:00:00Z",
    "type": "scrapbook"
  }
]
```

### Empty Collection Example

```json
{
  "collection_id": "coll-004",
  "user_id": "user-001",
  "name": "Empty Album",
  "photo_ids": [],
  "tags": [],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "type": "album"
}
```

---

## users.json

**Purpose:** Sample user accounts

**Location:** `/src/mocks/users.json`

### Structure

```json
[
  {
    "user_id": "string (UUID)",
    "email": "string (email)",
    "name": "string",
    "dropbox_access_token": "string (optional)",
    "dropbox_refresh_token": "string (optional)",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
]
```

### Complete Example

```json
[
  {
    "user_id": "user-001",
    "email": "user@example.com",
    "name": "John Doe",
    "dropbox_access_token": null,
    "dropbox_refresh_token": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  {
    "user_id": "user-002",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "dropbox_access_token": "mock-dropbox-token-xyz",
    "dropbox_refresh_token": "mock-refresh-token-xyz",
    "created_at": "2024-01-05T10:00:00Z",
    "updated_at": "2024-01-05T10:00:00Z"
  }
]
```

---

## Realistic Metadata from Dropbox

### Dropbox Metadata Structure

When syncing with real Dropbox (Phase 4), metadata looks like:

```json
{
  "name": "IMG_20240115_103000.jpg",
  "path_lower": "/photos/img_20240115_103000.jpg",
  "path_display": "/Photos/IMG_20240115_103000.jpg",
  "id": "id:abc123XYZ",
  "client_modified": "2024-01-15T10:30:00Z",
  "server_modified": "2024-01-15T10:32:00Z",
  "rev": "015f9e5c123456",
  "size": 2048000,
  "is_downloadable": true,
  "content_hash": "abc123def456...",
  ".tag": "file"
}
```

For mock data, include subset of these fields:

```json
{
  "name": "IMG_001.jpg",
  "size": 2048000,
  "client_modified": "2024-01-15T10:00:00Z",
  "content_hash": "abc123..."
}
```

---

## How to Add More Mock Data

### Adding Photos

1. Open `/src/mocks/photos.json`
2. Add new photo object:
   ```json
   {
     "photo_id": "photo-XXX",
     "tags": ["your", "tags"],
     "created_at": "2024-XX-XXT00:00:00Z",
     "updated_at": "2024-XX-XXT00:00:00Z",
     "owner_id": "user-001",
     "dropbox_file_id": "id:mock-dropbox-file-XXX",
     "dropbox_url": "https://via.placeholder.com/800x600/COLOR/ffffff?text=Your+Text",
     "dropbox_metadata": {
       "name": "Your_Photo.jpg",
       "size": 2048000,
       "client_modified": "2024-XX-XXT00:00:00Z"
     },
     "hash": "unique-hash-XXX",
     "file_size": 2048000
   }
   ```

3. Use https://via.placeholder.com for `dropbox_url` during development

### Adding Collections

1. Open `/src/mocks/collections.json`
2. Add new collection:
   ```json
   {
     "collection_id": "coll-XXX",
     "user_id": "user-001",
     "name": "Your Collection Name",
     "photo_ids": ["photo-001", "photo-002"],
     "tags": ["your", "tags"],
     "created_at": "2024-XX-XXT00:00:00Z",
     "updated_at": "2024-XX-XXT00:00:00Z",
     "type": "album"
   }
   ```

### Adding Users

1. Open `/src/mocks/users.json`
2. Add new user:
   ```json
   {
     "user_id": "user-XXX",
     "email": "newuser@example.com",
     "name": "New User",
     "dropbox_access_token": null,
     "dropbox_refresh_token": null,
     "created_at": "2024-XX-XXT00:00:00Z",
     "updated_at": "2024-XX-XXT00:00:00Z"
   }
   ```

---

## Data Relationships in Mock Files

### User → Photos

- Photos have `owner_id` field matching `user_id` in users.json
- Example:
  ```json
  // users.json
  { "user_id": "user-001", ... }

  // photos.json
  { "photo_id": "photo-001", "owner_id": "user-001", ... }
  ```

### Collections → Photos

- Collections have `photo_ids` array with photo UUIDs
- Example:
  ```json
  // photos.json
  { "photo_id": "photo-001", ... }
  { "photo_id": "photo-002", ... }

  // collections.json
  {
    "collection_id": "coll-001",
    "photo_ids": ["photo-001", "photo-002"],
    ...
  }
  ```

### User → Collections

- Collections have `user_id` field matching `user_id` in users.json
- Example:
  ```json
  // users.json
  { "user_id": "user-001", ... }

  // collections.json
  { "collection_id": "coll-001", "user_id": "user-001", ... }
  ```

---

## Placeholder Image URLs

Use https://via.placeholder.com for development:

```
Format: https://via.placeholder.com/{width}x{height}/{bg_color}/{text_color}?text={url_encoded_text}

Examples:
https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Photo+1
https://via.placeholder.com/800x600/4ECDC4/ffffff?text=Beach+Sunset
https://via.placeholder.com/800x600/95E1D3/ffffff?text=Family+Portrait

Color codes:
- FF6B6B: Red
- 4ECDC4: Teal
- 95E1D3: Mint
- F38181: Pink
- AA96DA: Purple
- FCBAD3: Light Pink
```

---

## Data Validation

### Photo Validation

- `photo_id`: Unique, non-empty string
- `owner_id`: Must match a user in users.json
- `tags`: Array of strings (can be empty)
- `created_at`, `updated_at`: Valid ISO 8601 timestamps
- `dropbox_url`: Valid URL (use placeholder.com for mock)
- `hash`: String (duplicates should share same hash)
- `file_size`: Positive number

### Collection Validation

- `collection_id`: Unique, non-empty string
- `user_id`: Must match a user in users.json
- `photo_ids`: Array of strings (can be empty)
  - Each ID should match a photo in photos.json
- `type`: Either 'album' or 'scrapbook'

### User Validation

- `user_id`: Unique, non-empty string
- `email`: Valid email format, unique
- Tokens can be null in mock data

---

## Testing with Mock Data

### Test Scenarios

1. **Empty state:** User with no photos/collections
2. **Single item:** User with 1 photo, 1 collection
3. **Many items:** User with 50+ photos, 10+ collections
4. **Duplicates:** Photos with identical hashes
5. **Edge cases:**
   - Collection with deleted photo IDs
   - Photo with no tags
   - Very long photo names

### Example: Testing Duplicate Detection

```json
// Create 3 photos with same hash
[
  { "photo_id": "photo-001", "hash": "duplicate-hash-1", ... },
  { "photo_id": "photo-002", "hash": "duplicate-hash-1", ... },
  { "photo_id": "photo-003", "hash": "duplicate-hash-1", ... }
]

// Expected: Duplicate detection finds 1 group with 3 photos
```
