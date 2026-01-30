# Implementation Phases

## Overview

Implementation is divided into 8 phases, each with clear goals, tasks, and verification steps. Phases 1-5 use mock data, Phase 6 migrates to PostgreSQL, and Phase 7 adds print/email functionality.

---

## Phase 0: Foundation

**Goal:** Project scaffolding and directory structure

### Tasks

1. Initialize Next.js with TypeScript
   ```bash
   npx create-next-app@latest . --typescript --app --no-src
   ```

2. Create directory structure
   ```bash
   mkdir -p src/{app,components,lib,mocks}
   mkdir -p src/lib/{data,services,utils,types}
   mkdir -p src/lib/data/providers
   mkdir -p src/app/api/{auth,photos,collections,duplicates,dropbox}
   ```

3. Create mock data files
   ```bash
   touch src/mocks/{photos,collections,users}.json
   ```

4. Create environment file
   ```bash
   cp .env.example .env.local
   ```

### Dependencies

```bash
npm install
npm install --save-dev @types/node
```

### Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] TypeScript compiles successfully
- [ ] Directory structure matches plan
- [ ] Mock data files exist

---

## Phase 1: Mock Data + Photo Viewer

**Goal:** Build photo viewer with filtering using mock data

### Critical Files

- `src/lib/data/interfaces.ts` - Data contracts
- `src/lib/data/providers/mock.ts` - Mock provider implementation
- `src/lib/data/index.ts` - Provider factory (SWAP POINT)
- `src/mocks/photos.json` - Sample photo data
- `src/app/api/photos/route.ts` - Photo API endpoint
- `src/components/PhotoGrid.tsx` - Photo grid component
- `src/components/PhotoCard.tsx` - Individual photo card
- `src/components/FilterBar.tsx` - Tag and date filters
- `src/components/PhotoViewer.tsx` - Photo detail modal
- `src/app/viewer/page.tsx` - Photo viewer page

### Tasks

1. Create DataProvider interface with full contract
2. Implement MockDataProvider with in-memory arrays
3. Create mock photo data (include 2+ duplicates with same hash)
4. Build PhotoGrid component with responsive grid layout
5. Build FilterBar component (tag selector, date range)
6. Build PhotoViewer modal for photo details
7. Create /viewer route that uses mock data
8. Add API route for /api/photos

### Dependencies

```bash
npm install date-fns  # Date utilities
```

### Verification Checklist

- [ ] Navigate to `/viewer` shows photo grid
- [ ] Filter by tags works correctly
- [ ] Filter by date range works
- [ ] Click photo opens detail modal
- [ ] Photo metadata displays correctly
- [ ] Placeholder images load (via placeholder.com URLs)

---

## Phase 2: Collections (Albums)

**Goal:** Create and organize photos into collections

### Critical Files

- `src/app/api/collections/route.ts` - Collection list/create
- `src/app/api/collections/[id]/route.ts` - Collection detail/update/delete
- `src/components/CollectionList.tsx` - List of collections
- `src/components/CollectionEditor.tsx` - Drag-drop editor
- `src/app/collections/page.tsx` - Collections list page
- `src/app/collections/[id]/page.tsx` - Collection detail page

### Tasks

1. Add collection methods to DataProvider interface
2. Implement collection CRUD in MockProvider
3. Create mock collection data
4. Build CollectionList component
5. Build CollectionEditor with drag-drop
6. Create /collections route
7. Create /collections/[id] route
8. Add API routes for collections

### Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Verification Checklist

- [ ] Can create new collection
- [ ] Can drag photo into collection
- [ ] Can remove photo from collection
- [ ] Can delete collection
- [ ] Changes persist in mock provider (in-memory during session)
- [ ] Collection list displays correctly

---

## Phase 3: Duplicate Detection

**Goal:** Detect exact duplicates and move to Dropbox/Duplicates folder

### Critical Files

- `src/lib/services/duplicateService.ts` - Core detection logic
- `src/lib/utils/hash.ts` - Hash computation
- `src/app/api/duplicates/detect/route.ts` - Scan endpoint
- `src/app/api/duplicates/move/route.ts` - Move endpoint
- `src/components/DuplicateDetector.tsx` - Scan trigger UI
- `src/components/DuplicateGroup.tsx` - Duplicate group display
- `src/app/duplicates/page.tsx` - Duplicates page

### Tasks

1. Create DuplicateService class
2. Implement exact match detection (hash comparison)
3. Create hash utility functions
4. Build DuplicateDetector component
5. Build DuplicateGroup component (side-by-side comparison)
6. Create /duplicates route
7. Add API routes for duplicate detection
8. Mock "move to Duplicates folder" (update tags)

### Detection Strategy

**Phase 3 (Exact Matches):**
- Compare SHA256 file hashes
- Group photos with identical hash
- UI shows groups with 2+ photos
- User selects "keeper"
- Non-keeper photos tagged with 'duplicate'

**Future Enhancement (Phase 2+):**
- Visual similarity using perceptual hashing
- Detect cropped/resized versions
- Similarity threshold slider

### Dependencies

```bash
npm install crypto  # Built-in Node.js module
```

### Verification Checklist

- [ ] Scan detects duplicate photos from mock data
- [ ] UI shows duplicate groups side-by-side
- [ ] Can select "keeper" photo
- [ ] Non-keeper photos tagged as 'duplicate'
- [ ] Mock data reflects changes

---

## Phase 4: Dropbox Integration

**Goal:** Connect to real Dropbox account and sync photos

### Setup

1. Create Dropbox app at https://www.dropbox.com/developers/apps
2. Choose "Scoped access" and "Full Dropbox" access
3. Get App Key and App Secret
4. Add redirect URI: `http://localhost:3000/api/auth/callback`

### Critical Files

- `src/lib/services/dropboxService.ts` - Dropbox API wrapper
- `src/app/api/auth/dropbox/route.ts` - OAuth initiate
- `src/app/api/auth/callback/route.ts` - OAuth callback
- `src/app/api/dropbox/sync/route.ts` - Fetch photos
- `src/app/api/dropbox/move/route.ts` - Move file

### Tasks

1. Create DropboxService class
2. Implement OAuth flow (initiate + callback)
3. Implement photo fetch from Dropbox
4. Implement file move operation
5. Add token refresh logic
6. Create sync button in UI
7. Update photo viewer to show real Dropbox photos

### Dependencies

```bash
npm install dropbox isomorphic-fetch
```

### Environment Variables

Add to `.env.local`:
```bash
DROPBOX_APP_KEY=your_app_key
DROPBOX_APP_SECRET=your_app_secret
DROPBOX_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Verification Checklist

- [ ] OAuth flow redirects to Dropbox
- [ ] User authorizes app successfully
- [ ] Callback receives access and refresh tokens
- [ ] Sync fetches real photos from Dropbox
- [ ] Photos display in viewer with real images
- [ ] Move file to /Duplicates folder works in Dropbox
- [ ] Token refresh works when access token expires
- [ ] Error handling for API failures

---

## Phase 5: Scrapbook View

**Goal:** Convert collections to printable scrapbook layout

### Critical Files

- `src/components/ScrapbookLayout.tsx` - Print layout container
- `src/components/ScrapbookPage.tsx` - Single page component
- `src/app/scrapbook/[id]/page.tsx` - Scrapbook view route
- `src/app/collections/[id]/page.tsx` - Add toggle button

### Tasks

1. Create ScrapbookLayout component (print-friendly)
2. Create ScrapbookPage component (2x2 photo grid)
3. Add "View as Scrapbook" toggle in collection detail
4. Create /scrapbook/[id] route
5. Implement page navigation
6. Add print preview styles

### UI Flow

```
Collections List
    ↓
Collection Detail (Album View)
    ↓ [Toggle]
Scrapbook View (Print Layout)
    ↓
Print Preview
```

### Verification Checklist

- [ ] Toggle from album to scrapbook view works
- [ ] Photos display in print-friendly layout
- [ ] Print preview works correctly
- [ ] Can navigate between pages
- [ ] Page breaks display correctly
- [ ] Layout looks good on different paper sizes

---

## Phase 6: Database Migration (Neon PostgreSQL)

**Goal:** Replace mock provider with real database

### Setup

1. Create Neon PostgreSQL account at https://neon.tech
2. Create new project and database
3. Get connection string
4. Add to `.env.local`

### Critical Files

- `migrations/001_initial_schema.sql` - Database schema
- `src/lib/data/providers/postgres.ts` - Postgres provider
- Update `.env.local`

### Tasks

1. Write SQL migration script
2. Create PostgresDataProvider class
3. Implement all DataProvider interface methods
4. Test methods match mock provider behavior
5. Run migration to create tables
6. Toggle `NEXT_PUBLIC_USE_MOCK_DATA=false`
7. Test all features with real database

### Dependencies

```bash
npm install @neondatabase/serverless
```

### Environment Variables

Add to `.env.local`:
```bash
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Migration

Run migration:
```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### Verification Checklist

- [ ] Postgres provider implements full interface
- [ ] Toggle `USE_MOCK_DATA=false` works
- [ ] All UI flows work identically to mock phase
- [ ] Data persists after server restart
- [ ] CRUD operations work correctly
- [ ] Relationships (user → photos, collections) work
- [ ] Array fields (photo_ids, tags) work correctly
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## Phase 7: Print/Email Skeleton

**Goal:** Basic print and email functionality (mock for now)

### Critical Files

- `src/components/PrintDialog.tsx` - Print settings modal
- `src/components/EmailForm.tsx` - Email recipient form
- `src/app/api/print/route.ts` - Mock print endpoint
- `src/app/api/email/route.ts` - Mock email endpoint

### Tasks

1. Create PrintDialog component
   - Paper size selector (Letter, A4, etc.)
   - Orientation (Portrait/Landscape)
   - Page range selector
2. Create EmailForm component
   - Recipient email input
   - Subject and message fields
3. Add print button to scrapbook view
4. Add email button to scrapbook view
5. Create mock API endpoints
6. Show success confirmation

### Features

**Print Dialog:**
- Paper size selection
- Orientation selection
- Page range (All, Current, Custom)
- Print preview

**Email Form:**
- Recipient email (with validation)
- Optional message
- Mock send confirmation

### Verification Checklist

- [ ] Print button opens dialog
- [ ] Print preview shows correct layout
- [ ] Email button opens form
- [ ] Form validation works
- [ ] Mock send shows success message
- [ ] Error handling for invalid input

---

## Critical Path

```
Phase 0: Foundation (1 day)
    ↓
Phase 1: Mock Data + Viewer (2-3 days)
    ↓
Phase 2: Collections (2 days)
    ↓
Phase 3: Duplicate Detection (2 days)
    ↓
Phase 4: Dropbox Integration (3 days)
    ↓
Phase 5: Scrapbook View (2 days)
    ↓
Phase 6: Database Migration (3 days)
    ↓
Phase 7: Print/Email (2 days)
```

**Total Estimated Effort:** 17-18 days

---

## Dependencies Between Phases

- Phase 1 → Phase 2: Collections depend on photo data structure
- Phase 2 → Phase 3: Duplicates shown in collection context
- Phase 3 → Phase 4: Duplicate move requires Dropbox integration
- Phase 4 can run parallel to Phase 2-3 (mock data first)
- Phase 5 depends on Phase 2 (collections exist)
- Phase 6 can happen anytime after Phase 5 (swap providers)
- Phase 7 depends on Phase 5 (scrapbook view exists)

---

## Testing Strategy

Each phase includes verification checklist. Test:

1. **Happy path**: Expected user flow works
2. **Edge cases**: Empty states, single item, many items
3. **Error handling**: API failures, invalid input
4. **Data persistence**: Changes save correctly
5. **UI responsiveness**: Works on different screen sizes

Run through all verification checklists before moving to next phase.
