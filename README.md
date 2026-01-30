# Monica's Storybook

A photo organization app that treats your memories with care.

## What It Does

Browse photos from multiple storage providers, find duplicates without deleting originals, organize into collections, and create printable storybooks.

## Core Principle

**Non-destructive by design.** Your photos stay exactly where they are—this app only references your storage, never moves or deletes files.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Mock data provider (swappable to PostgreSQL)

## Key Features

- **Cross-provider tracking** - Track photos across Dropbox, Google Photos, iCloud
- **Duplicate detection** - Find duplicates by hash without deleting
- **Drag-drop collections** - Organize photos into albums
- **Scrapbook layouts** - Generate printable storybooks

## Project Structure

```
src/
├── app/              # Routes and API endpoints
├── components/       # React components
├── lib/
│   ├── data/        # Data provider (mock ↔ postgres swap point)
│   ├── types/       # TypeScript interfaces
│   └── utils/       # Utilities
└── mocks/           # Mock JSON data
```

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true  # false = use postgres
```

## Documentation

See `_docs/` for details:
- `ARCHITECTURE.md` - System design
- `DATABASE_SCHEMA.md` - Schema with source field
- `PHASES.md` - Implementation roadmap
- `USER_FLOW.md` - Product narrative
