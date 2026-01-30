# System Architecture

## System Invariants and Primitives

### Data Primitives

```
Photo = { id, metadata, source_refs, hash }
Collection = { id, photo_refs, metadata }
User = { id, auth_tokens, metadata }
```

### State Primitives

```
Source State (Dropbox) ─┬─ sync ─→ Local State (App)
                        └─ conflict resolution rules
```

### Abstraction Layers

```
UI Layer (React Components)
    ↓ (props/events)
Service Layer (business logic)
    ↓ (interfaces)
Data Layer (mock → postgres swap point)
    ↓ (provider pattern)
Source Layer (Dropbox API)
```

## Core Abstraction: Data Provider Interface

The key architectural decision is the **Provider Interface Pattern** that enables clean swap from mock to real database:

```
UI Components
    ↓
API Routes
    ↓
Service Layer
    ↓
DataProvider Interface ← SWAP POINT (mock vs postgres)
    ↓
┌─────────┐        ┌──────────┐
│  Mock   │   OR   │Postgres  │
│Provider │        │Provider  │
└─────────┘        └──────────┘
```

**Environment variable controls swap:**
- `NEXT_PUBLIC_USE_MOCK_DATA=true` → Mock provider (Phase 1-5)
- `NEXT_PUBLIC_USE_MOCK_DATA=false` → Postgres provider (Phase 6+)

### Provider Interface Contract

```typescript
export interface DataProvider {
  // Photos
  getPhotos(userId: string, filters?: PhotoFilter): Promise<Photo[]>;
  getPhoto(photoId: string): Promise<Photo | null>;
  createPhoto(photo: Omit<Photo, 'photo_id' | 'created_at' | 'updated_at'>): Promise<Photo>;
  updatePhoto(photoId: string, updates: Partial<Photo>): Promise<Photo>;
  deletePhoto(photoId: string): Promise<void>;

  // Collections
  getCollections(userId: string): Promise<Collection[]>;
  getCollection(collectionId: string): Promise<Collection | null>;
  createCollection(collection: Omit<Collection, 'collection_id' | 'created_at' | 'updated_at'>): Promise<Collection>;
  updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection>;
  deleteCollection(collectionId: string): Promise<void>;
  addPhotosToCollection(collectionId: string, photoIds: string[]): Promise<Collection>;
  removePhotosFromCollection(collectionId: string, photoIds: string[]): Promise<Collection>;

  // Users
  getUser(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'user_id'>): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
}
```

## Decision Trees

### Data Access Pattern

```
Data Access Pattern?
  ├─ Mock Phase (Phase 1-3)
  │   └─ Interface → MockProvider → Hardcoded JSON
  │       └─ Swap Point: Change provider, keep interface
  └─ Production Phase (Phase 4+)
      └─ Interface → PostgresProvider → Neon DB
          └─ Same interface contract
```

### Duplicate Detection

```
Detect Duplicates?
  ├─ Phase 1: Exact Match
  │   ├─ Hash match → Identical files
  │   ├─ Size + name match → Likely duplicates
  │   └─ Action: Move to Dropbox/Duplicates
  └─ Phase 2: Perceptual Hash (later)
      ├─ pHash distance < threshold → Similar images
      └─ Action: Suggest review, then move
```

### Collection Type

```
Collection Entity (single table)
  ├─ UI Context = "album" → PhotoGrid layout
  │   └─ Features: drag-drop, tags, filters
  └─ UI Context = "scrapbook" → Print layout
      └─ Features: page layout, captions, print
```

## Data Flow Diagram

```
User Interaction
    ↓
React Component (UI state)
    ↓
Service Layer (business logic)
    ↓
Data Provider Interface ←─── SWAP POINT
    ↓                         (mock vs postgres)
┌───┴────┐
│  Mock  │  (Phase 1-5)
│Provider│  → JSON files
└────────┘
    OR
┌──────────┐
│Postgres  │  (Phase 6+)
│Provider  │  → Neon DB
└──────────┘

Dropbox Service (parallel)
    ↓
Dropbox API
    └─ OAuth, fetch photos, move files
```

## Component State Flow

### PhotoGrid Component
```
PhotoGrid Component
  ├─ useState(photos) ← fetch('/api/photos')
  ├─ useState(filters) ← user input
  └─ useEffect(() => refetch) when filters change
```

### CollectionEditor Component
```
CollectionEditor Component
  ├─ useState(collection) ← fetch('/api/collections/[id]')
  ├─ useState(availablePhotos) ← fetch('/api/photos')
  ├─ onDragEnd → POST /api/collections/[id]/photos
  └─ Optimistic update → re-fetch
```

### DuplicateDetector Component
```
DuplicateDetector Component
  ├─ useState(duplicateGroups) ← POST /api/duplicates/detect
  ├─ onSelectKeeper → POST /api/duplicates/move
  └─ Re-fetch photos after move
```

## Failure Modes and Mitigations

### Mock → Postgres Swap Fails
- **Cause:** Interface mismatch between providers
- **Prevention:** TypeScript compiler enforces interface contract
- **Mitigation:** Run tests on both providers before swap

### Duplicate Detection Misses Files
- **Cause:** Hash not computed for all photos
- **Prevention:** Hash computation in sync pipeline
- **Mitigation:** Run batch hash computation on existing photos

### Dropbox Token Expires
- **Cause:** Refresh token not used
- **Prevention:** Token refresh logic in dropboxService
- **Mitigation:** Automatic token refresh before API calls

### Collection References Deleted Photos
- **Cause:** No cascade delete on photo removal
- **Prevention:** Cleanup hook in deletePhoto service
- **Mitigation:** Periodic integrity check to remove orphaned references

## Key Architectural Decisions

| Decision | Option A | Option B | Choice | Reason |
|----------|----------|----------|--------|--------|
| Data abstraction | Service layer calls DB directly | Provider interface pattern | **Provider interface** | Clean swap point, testable |
| Collection storage | Separate album/scrapbook tables | Single table with type field | **Single table** | Same entity, UI context differs |
| Photo refs in Collection | Array of IDs | Junction table | **Array of IDs** | Simple for Phase 1-5, refactor later if needed |
| Duplicate detection | Immediate perceptual hash | Start exact, add visual later | **Exact first** | Ship faster, add complexity incrementally |
| Dropbox state | App is source of truth | Dropbox is source of truth | **Dropbox is source** | User may organize in Dropbox directly |
| Mock data location | Hardcoded in components | Centralized JSON files | **Centralized JSON** | Single swap point, reusable |
