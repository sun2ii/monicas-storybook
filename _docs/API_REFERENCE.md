# API Reference

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All API routes (except OAuth endpoints) require authentication. User ID is extracted from session/token.

---

## Authentication Endpoints

### Initiate Dropbox OAuth

```
GET /api/auth/dropbox
```

Redirects user to Dropbox OAuth consent page.

**Response:**
- 302 Redirect to Dropbox OAuth URL

**Example:**
```bash
curl http://localhost:3000/api/auth/dropbox
# Redirects to: https://www.dropbox.com/oauth2/authorize?client_id=...
```

---

### OAuth Callback

```
GET /api/auth/callback
```

Handles OAuth callback from Dropbox with authorization code.

**Query Parameters:**
- `code` (string): OAuth authorization code from Dropbox
- `state` (string): CSRF protection token

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Missing or invalid authorization code
- 500: Dropbox API error

---

### Logout

```
POST /api/auth/logout
```

Clears authentication session and tokens.

**Response:**
```json
{
  "success": true
}
```

---

## Photo Endpoints

### List Photos

```
GET /api/photos
```

Retrieve photos for authenticated user with optional filters.

**Query Parameters:**
- `tags` (string, optional): Comma-separated tags (e.g., "family,vacation")
- `startDate` (ISO 8601, optional): Filter photos after this date
- `endDate` (ISO 8601, optional): Filter photos before this date
- `searchTerm` (string, optional): Search in photo metadata

**Response:**
```json
{
  "photos": [
    {
      "photo_id": "uuid",
      "tags": ["family", "2024"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "owner_id": "uuid",
      "dropbox_file_id": "id:abc123",
      "dropbox_url": "https://dl.dropboxusercontent.com/...",
      "dropbox_metadata": {
        "name": "IMG_001.jpg",
        "size": 2048000,
        "client_modified": "2024-01-15T10:00:00Z"
      },
      "hash": "abc123...",
      "file_size": 2048000
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/photos?tags=family,vacation
```

---

### Get Photo Details

```
GET /api/photos/[id]
```

Retrieve single photo by ID.

**Path Parameters:**
- `id` (string): Photo UUID

**Response:**
```json
{
  "photo": {
    "photo_id": "uuid",
    "tags": ["family", "2024"],
    ...
  }
}
```

**Errors:**
- 404: Photo not found
- 403: Not authorized to view this photo

---

### Create Photo

```
POST /api/photos
```

Create new photo entry (typically from Dropbox sync).

**Request Body:**
```json
{
  "tags": ["family", "vacation"],
  "dropbox_file_id": "id:abc123",
  "dropbox_url": "https://...",
  "dropbox_metadata": {
    "name": "IMG_001.jpg",
    "size": 2048000
  },
  "hash": "abc123...",
  "file_size": 2048000
}
```

**Response:**
```json
{
  "photo": {
    "photo_id": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    ...
  }
}
```

---

### Update Photo

```
PUT /api/photos/[id]
```

Update photo metadata (e.g., add tags).

**Path Parameters:**
- `id` (string): Photo UUID

**Request Body:**
```json
{
  "tags": ["family", "vacation", "2024"],
  "dropbox_metadata": {
    "custom_field": "value"
  }
}
```

**Response:**
```json
{
  "photo": {
    "photo_id": "uuid",
    "updated_at": "2024-01-15T11:00:00Z",
    ...
  }
}
```

---

### Delete Photo

```
DELETE /api/photos/[id]
```

Delete photo entry (does not delete from Dropbox).

**Path Parameters:**
- `id` (string): Photo UUID

**Response:**
```json
{
  "success": true
}
```

---

## Collection Endpoints

### List Collections

```
GET /api/collections
```

Retrieve all collections for authenticated user.

**Query Parameters:**
- `type` (string, optional): Filter by type ('album' or 'scrapbook')

**Response:**
```json
{
  "collections": [
    {
      "collection_id": "uuid",
      "user_id": "uuid",
      "name": "Summer Vacation 2024",
      "photo_ids": ["uuid1", "uuid2"],
      "tags": ["vacation", "2024"],
      "created_at": "2024-01-16T12:00:00Z",
      "updated_at": "2024-01-16T12:00:00Z",
      "type": "album"
    }
  ]
}
```

---

### Get Collection

```
GET /api/collections/[id]
```

Retrieve single collection with full photo details.

**Path Parameters:**
- `id` (string): Collection UUID

**Response:**
```json
{
  "collection": {
    "collection_id": "uuid",
    "name": "Summer Vacation 2024",
    "photo_ids": ["uuid1", "uuid2"],
    "photos": [
      {
        "photo_id": "uuid1",
        ...
      }
    ],
    ...
  }
}
```

---

### Create Collection

```
POST /api/collections
```

Create new collection.

**Request Body:**
```json
{
  "name": "Summer Vacation 2024",
  "tags": ["vacation", "2024"],
  "photo_ids": [],
  "type": "album"
}
```

**Response:**
```json
{
  "collection": {
    "collection_id": "uuid",
    "created_at": "2024-01-16T12:00:00Z",
    ...
  }
}
```

---

### Update Collection

```
PUT /api/collections/[id]
```

Update collection metadata.

**Path Parameters:**
- `id` (string): Collection UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "tags": ["new", "tags"],
  "type": "scrapbook"
}
```

---

### Delete Collection

```
DELETE /api/collections/[id]
```

Delete collection (photos remain).

**Path Parameters:**
- `id` (string): Collection UUID

**Response:**
```json
{
  "success": true
}
```

---

### Add Photos to Collection

```
POST /api/collections/[id]/photos
```

Add photos to existing collection.

**Path Parameters:**
- `id` (string): Collection UUID

**Request Body:**
```json
{
  "photo_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "collection": {
    "collection_id": "uuid",
    "photo_ids": ["existing1", "uuid1", "uuid2", "uuid3"],
    ...
  }
}
```

---

## Duplicate Detection Endpoints

### Detect Duplicates

```
POST /api/duplicates/detect
```

Scan user's photos for duplicates.

**Request Body:**
```json
{
  "match_type": "exact"
}
```

**Response:**
```json
{
  "duplicate_groups": [
    {
      "hash": "abc123...",
      "match_type": "exact",
      "photos": [
        {
          "photo_id": "uuid1",
          "dropbox_url": "...",
          ...
        },
        {
          "photo_id": "uuid2",
          "dropbox_url": "...",
          ...
        }
      ]
    }
  ]
}
```

---

### Move Duplicates

```
POST /api/duplicates/move
```

Move duplicate photos to /Duplicates folder in Dropbox.

**Request Body:**
```json
{
  "duplicate_group": {
    "hash": "abc123...",
    "photos": [...]
  },
  "keeper_photo_id": "uuid1"
}
```

**Response:**
```json
{
  "success": true,
  "moved_count": 1,
  "moved_photos": ["uuid2"]
}
```

---

## Dropbox Integration Endpoints

### Sync Photos from Dropbox

```
POST /api/dropbox/sync
```

Fetch photos from Dropbox and sync to local database.

**Request Body:**
```json
{
  "folder_path": "/Photos"
}
```

**Response:**
```json
{
  "success": true,
  "synced_count": 42,
  "new_photos": 15,
  "updated_photos": 27
}
```

---

### Move File in Dropbox

```
POST /api/dropbox/move
```

Move file to different folder in Dropbox.

**Request Body:**
```json
{
  "file_id": "id:abc123",
  "destination_path": "/Duplicates/IMG_001.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "new_path": "/Duplicates/IMG_001.jpg"
}
```

---

### List Dropbox Folders

```
GET /api/dropbox/folders
```

List folders in user's Dropbox.

**Query Parameters:**
- `path` (string, optional): Folder path (default: root)

**Response:**
```json
{
  "folders": [
    {
      "name": "Photos",
      "path": "/Photos",
      "id": "id:abc123"
    },
    {
      "name": "Duplicates",
      "path": "/Duplicates",
      "id": "id:def456"
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized for resource)
- 404: Not Found
- 500: Internal Server Error

**Common Error Codes:**
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User not authorized for resource
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request parameters
- `DROPBOX_ERROR`: Dropbox API error
- `DATABASE_ERROR`: Database operation failed
