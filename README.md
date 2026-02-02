# Monica's Storybook

A photo organization app that treats your memories with care.

## What It Does

Browse photos from multiple storage providers, find duplicates without deleting originals, organize into collections, and create professional-quality printable storybooks.

## Core Principle

**Non-destructive by design.** Your photos stay exactly where they are—this app only references your storage, never moves or deletes files.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16 (Turbopack) + TypeScript
- Tailwind CSS
- jsPDF for professional PDF generation
- react-masonry-css for flexible layouts
- Mock data provider (swappable to PostgreSQL)

## Key Features

### Photo Management
- **Masonry Grid Layout** - Photos displayed with preserved aspect ratios, no cropping
- **Cross-provider Tracking** - Track photos across Dropbox, Google Photos, iCloud
- **Smart Duplicate Detection** - Find duplicates by hash without deleting originals
- **Advanced Filtering** - Filter by tags, date ranges, and search terms

### Collections & Organization
- **Drag-and-Drop Collections** - Organize photos into custom albums with reordering
- **Visual Collection Previews** - 2×2 grid thumbnails or single photo previews
- **Collection Editor** - Add/remove photos with visual feedback

### Professional Scrapbook Generation
- **High-Quality PDF Export** - Direct image insertion at full resolution (300+ DPI)
- **Multiple Layout Templates**:
  - Full-bleed (single photo per page)
  - Two-up (side-by-side photos)
  - Grid (2×2 or flexible layouts)
- **Smart Layout Engine** - Automatically adjusts to photo aspect ratios
- **Vector Text Rendering** - Crisp, selectable captions and page numbers
- **Optimized File Sizes** - 30-50% smaller than traditional html2canvas approach

### User Experience
- **Site-wide Navigation** - Consistent menu across all pages
- **Onboarding Flow** - Get-started guide and storage connection wizard
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Print Preview** - See exactly what your scrapbook will look like

## Project Structure

```
src/
├── app/
│   ├── api/                  # API endpoints for photos, collections
│   ├── collections/          # Collection management pages
│   ├── connect-storage/      # Storage provider connection wizard
│   ├── duplicates/           # Duplicate photo detection
│   ├── get-started/          # Onboarding page
│   ├── scrapbook/            # Scrapbook editor and preview
│   └── viewer/               # Main photo viewer with masonry layout
├── components/
│   ├── MasonryPhotoGrid.tsx  # Masonry layout for photos
│   ├── MasonryPhotoCard.tsx  # Photo card with dynamic aspect ratios
│   ├── Navigation.tsx        # Site-wide navigation menu
│   ├── CollectionEditor.tsx  # Drag-and-drop collection builder
│   ├── scrapbook/            # Scrapbook components
│   │   ├── PrintPreview.tsx  # Professional PDF generation
│   │   └── ScrapbookPage.tsx # Layout templates
│   └── ...                   # Other UI components
├── lib/
│   ├── data/                 # Data provider (mock ↔ postgres swap point)
│   ├── types/                # TypeScript interfaces
│   └── utils/
│       ├── pdfLayout.ts      # PDF page layout calculator
│       ├── imageLoader.ts    # CORS-enabled image loader for PDFs
│       ├── aspectRatioUtils.ts  # Smart grid aspect ratio analysis
│       └── tokenStorage.ts   # OAuth token management
├── mocks/                    # Mock JSON data with photo dimensions
└── public/icons/             # Provider icons (Google Photos, etc.)
```

## Technical Highlights

### Masonry Photo Layout

The photo viewer uses a Pinterest-style masonry layout that preserves image aspect ratios:

- **No cropping**: Photos display at their natural aspect ratios
- **Responsive columns**: 1 column (mobile) → 2 (tablet) → 3 (medium) → 4 (desktop)
- **Smart sizing**: Dynamic aspect ratio analysis ensures photos fit naturally
- **Performance**: Uses `react-masonry-css` for pure CSS column layout (no JS overhead)

```typescript
// Analyzes photos and returns optimal grid configuration
analyzeAspectRatios(photos) → {
  average: number,
  dominant: 'portrait' | 'landscape' | 'square' | 'mixed',
  gridLayout: { cols: string, aspectRatio: string }
}
```

### Professional PDF Generation

Traditional approach (html2canvas):
```
Photos → HTML Layout → Canvas Rasterization → JPEG Compression → PDF
Result: ~288 DPI max, double compression, larger files
```

Our professional approach:
```
Photos → Load at Full Resolution → Direct PDF Insertion → Vector Text
Result: Original resolution (300+ DPI), single compression, smaller files
```

**Key advantages:**
- Images maintain full camera resolution (typically 300+ DPI)
- Text is crisp and selectable (not rasterized)
- 30-50% smaller file sizes
- Faster generation (no canvas rendering)
- Professional print quality matching industry standards

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true  # false = use postgres
```

## Current Implementation Status

✅ **Completed:**
- Photo viewer with masonry layout
- Collection management with drag-and-drop
- Duplicate detection
- Professional PDF generation
- Multi-template scrapbook layouts
- Navigation and onboarding
- Mock data provider

🚧 **In Progress:**
- Storage provider OAuth integration (Dropbox, Google Photos)
- PostgreSQL data provider
- Real-time photo sync

## Documentation

See `_docs/` for details:
- `ARCHITECTURE.md` - System design
- `DATABASE_SCHEMA.md` - Schema with source field
- `PHASES.md` - Implementation roadmap
- `USER_FLOW.md` - Product narrative
