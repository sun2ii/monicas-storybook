# Component Hierarchy

## Overview

Component architecture follows a container/presentational pattern with reusable UI components and smart containers that handle data fetching.

## Component Tree

```
App Layout
└─ AuthProvider (Dropbox OAuth state)
    ├─ Navigation
    │   ├─ Logo
    │   ├─ NavLinks (Viewer, Collections, Duplicates)
    │   └─ UserMenu
    └─ Route-specific pages:

        /viewer (Photo Viewer Page)
        ├─ FilterBar
        │   ├─ TagFilter (multi-select)
        │   └─ DateRangeFilter
        └─ PhotoGrid
            └─ PhotoCard (repeating)
                └─ [Click] → PhotoViewer Modal

        /collections (Collections List Page)
        └─ CollectionList
            └─ CollectionCard (repeating)
                └─ [Click] → /collections/[id]

        /collections/[id] (Collection Detail Page)
        ├─ CollectionHeader
        │   ├─ CollectionName (editable)
        │   ├─ TagEditor
        │   └─ ViewToggle (Album ↔ Scrapbook)
        └─ CollectionEditor
            ├─ AvailablePhotos (PhotoGrid)
            └─ CollectionPhotos (PhotoGrid with drag-drop)

        /duplicates (Duplicate Detection Page)
        ├─ DuplicateDetector
        │   ├─ ScanButton
        │   └─ ScanProgress
        └─ DuplicateGroups
            └─ DuplicateGroup (repeating)
                ├─ PhotoComparison (side-by-side)
                └─ KeeperSelector

        /scrapbook/[id] (Scrapbook View Page)
        ├─ ScrapbookHeader
        │   ├─ PrintButton
        │   └─ EmailButton
        └─ ScrapbookLayout
            └─ ScrapbookPage[] (repeating)
                └─ PhotoPlacement (2x2 grid)
```

---

## Component Specifications

### PhotoGrid

**Purpose:** Display photos in responsive grid layout

**Props:**
```typescript
interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  selectable?: boolean;
  selectedPhotos?: string[];
  onSelectionChange?: (photoIds: string[]) => void;
  draggable?: boolean;
}
```

**State:**
```typescript
const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
```

**Behavior:**
- Responsive grid (1-4 columns based on screen width)
- Lazy loading for performance
- Click photo → Open PhotoViewer modal
- Optional: Multi-select with checkboxes
- Optional: Drag-drop enabled

**Usage:**
```tsx
<PhotoGrid
  photos={photos}
  onPhotoClick={(photo) => setSelectedPhoto(photo)}
  selectable
/>
```

---

### PhotoCard

**Purpose:** Individual photo thumbnail with metadata

**Props:**
```typescript
interface PhotoCardProps {
  photo: Photo;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  draggable?: boolean;
}
```

**Render:**
```tsx
<div className="photo-card">
  <img src={photo.dropbox_url} alt={photo.dropbox_metadata.name} />
  <div className="photo-info">
    <p>{photo.dropbox_metadata.name}</p>
    <div className="tags">
      {photo.tags.map(tag => <span>{tag}</span>)}
    </div>
  </div>
</div>
```

---

### PhotoViewer

**Purpose:** Modal for viewing photo details

**Props:**
```typescript
interface PhotoViewerProps {
  photo: Photo | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
```

**Features:**
- Full-size photo display
- Metadata display (filename, size, date, tags)
- Tag editor
- Navigation arrows (next/previous)
- Close on ESC key or backdrop click

---

### FilterBar

**Purpose:** Photo filtering controls

**Props:**
```typescript
interface FilterBarProps {
  availableTags: string[];
  selectedTags: string[];
  dateRange: { start: Date | null; end: Date | null };
  onTagsChange: (tags: string[]) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  onClearFilters: () => void;
}
```

**State:**
```typescript
const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
```

**Features:**
- Multi-select tag dropdown
- Date range picker
- Clear filters button
- Active filter badges

---

### CollectionList

**Purpose:** Display all user collections

**Props:**
```typescript
interface CollectionListProps {
  collections: Collection[];
  onCollectionClick: (id: string) => void;
  onCreateNew: () => void;
}
```

**Features:**
- Grid of collection cards
- Thumbnail preview (first 4 photos)
- Create new button
- Empty state when no collections

---

### CollectionEditor

**Purpose:** Drag-drop interface for organizing photos

**Props:**
```typescript
interface CollectionEditorProps {
  collection: Collection;
  availablePhotos: Photo[];
  onAddPhotos: (photoIds: string[]) => void;
  onRemovePhotos: (photoIds: string[]) => void;
  onReorder: (photoIds: string[]) => void;
}
```

**State:**
```typescript
const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
const [isDraggingOver, setIsDraggingOver] = useState(false);
```

**Features:**
- Two-pane layout: Available photos | Collection photos
- Drag photo from Available → Collection
- Drag photo within Collection to reorder
- Remove photo from Collection
- Optimistic UI updates

**Libraries:**
- `@dnd-kit/core` for drag-drop
- `@dnd-kit/sortable` for reordering

---

### DuplicateDetector

**Purpose:** Trigger duplicate scan and show progress

**Props:**
```typescript
interface DuplicateDetectorProps {
  onScanComplete: (groups: DuplicateGroup[]) => void;
}
```

**State:**
```typescript
const [isScanning, setIsScanning] = useState(false);
const [progress, setProgress] = useState(0);
const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
```

**Features:**
- Scan button
- Progress indicator
- Results summary (X duplicate groups found)
- Filter: exact matches only / include visual similarity

---

### DuplicateGroup

**Purpose:** Display group of duplicate photos

**Props:**
```typescript
interface DuplicateGroupProps {
  group: DuplicateGroup;
  onKeep: (photoId: string) => void;
}
```

**Features:**
- Side-by-side photo comparison
- Metadata comparison (size, date, filename)
- Select keeper radio buttons
- Move duplicates button
- Confirmation before moving

---

### ScrapbookLayout

**Purpose:** Print-friendly layout container

**Props:**
```typescript
interface ScrapbookLayoutProps {
  collection: Collection;
  photos: Photo[];
  pageSize?: 'letter' | 'a4';
  orientation?: 'portrait' | 'landscape';
}
```

**Features:**
- Page-based layout
- Page navigation (1/5, 2/5, etc.)
- Print styles (@media print)
- Page breaks between pages

---

### ScrapbookPage

**Purpose:** Single scrapbook page with photos

**Props:**
```typescript
interface ScrapbookPageProps {
  photos: Photo[];
  pageNumber: number;
  layout?: '2x2' | '3x3' | 'freeform';
}
```

**Features:**
- 2x2 photo grid (default)
- Photo captions (filename or custom)
- Page number footer
- Print-friendly spacing

---

## Shared Utilities and Hooks

### usePhotoFilters

**Purpose:** Handle photo filtering logic

```typescript
function usePhotoFilters(photos: Photo[]) {
  const [filteredPhotos, setFilteredPhotos] = useState(photos);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    let result = photos;

    if (selectedTags.length > 0) {
      result = result.filter(p =>
        selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    if (dateRange) {
      result = result.filter(p => {
        const date = new Date(p.created_at);
        return date >= dateRange.start && date <= dateRange.end;
      });
    }

    setFilteredPhotos(result);
  }, [photos, selectedTags, dateRange]);

  return { filteredPhotos, selectedTags, setSelectedTags, dateRange, setDateRange };
}
```

---

### usePhotos

**Purpose:** Fetch and manage photos

```typescript
function usePhotos(userId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch(`/api/photos?userId=${userId}`);
        const data = await response.json();
        setPhotos(data.photos);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [userId]);

  return { photos, loading, error, refetch: fetchPhotos };
}
```

---

### useCollections

**Purpose:** Fetch and manage collections

```typescript
function useCollections(userId: string) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      const response = await fetch(`/api/collections?userId=${userId}`);
      const data = await response.json();
      setCollections(data.collections);
      setLoading(false);
    }

    fetchCollections();
  }, [userId]);

  const createCollection = async (collection: Partial<Collection>) => {
    const response = await fetch('/api/collections', {
      method: 'POST',
      body: JSON.stringify(collection),
    });
    const data = await response.json();
    setCollections([...collections, data.collection]);
  };

  return { collections, loading, createCollection };
}
```

---

## Component Composition Patterns

### Container Components (Smart)

Handle data fetching and business logic:
- `/app/viewer/page.tsx` (fetches photos, manages filters)
- `/app/collections/[id]/page.tsx` (fetches collection, handles updates)

### Presentational Components (Dumb)

Receive data via props, emit events:
- `PhotoGrid`, `PhotoCard`, `FilterBar`
- Pure rendering, no API calls

### Example Pattern

```tsx
// Container component
export default function ViewerPage() {
  const { photos, loading } = usePhotos(userId);
  const { filteredPhotos, selectedTags, setSelectedTags } = usePhotoFilters(photos);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <FilterBar
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />
      <PhotoGrid photos={filteredPhotos} />
    </>
  );
}

// Presentational component
export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {photos.map(photo => (
        <PhotoCard key={photo.photo_id} photo={photo} />
      ))}
    </div>
  );
}
```

---

## Styling Strategy

**CSS Framework:** Tailwind CSS (recommended)

**Responsive Breakpoints:**
- `sm`: 640px (2 columns)
- `md`: 768px (3 columns)
- `lg`: 1024px (4 columns)

**Example:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {photos.map(...)}
</div>
```

**Print Styles:**
```css
@media print {
  .no-print { display: none; }
  .scrapbook-page { page-break-after: always; }
}
```
