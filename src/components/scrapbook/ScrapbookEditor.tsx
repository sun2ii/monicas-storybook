'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ScrapbookPage, { PageLayout } from './ScrapbookPage';

interface SortablePageProps {
  page: PageLayout;
  index: number;
  onCaptionChange: (pageId: string, caption: string) => void;
}

function SortablePage({ page, index, onCaptionChange }: SortablePageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600 z-10"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
        </svg>
      </div>

      <ScrapbookPage
        page={page}
        pageNumber={index + 1}
        onCaptionChange={onCaptionChange}
      />
    </div>
  );
}

interface ScrapbookEditorProps {
  pages: PageLayout[];
  onPagesChange: (pages: PageLayout[]) => void;
  onCaptionChange: (pageId: string, caption: string) => void;
}

export default function ScrapbookEditor({
  pages,
  onPagesChange,
  onCaptionChange,
}: ScrapbookEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePage = activeId
    ? pages.find(p => p.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex(p => p.id === active.id);
      const newIndex = pages.findIndex(p => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newPages = arrayMove(pages, oldIndex, newIndex);
        onPagesChange(newPages);
      }
    }

    setActiveId(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8 pl-8">
        <SortableContext
          items={pages.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {pages.map((page, index) => (
            <SortablePage
              key={page.id}
              page={page}
              index={index}
              onCaptionChange={onCaptionChange}
            />
          ))}
        </SortableContext>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePage ? (
          <div className="opacity-90 shadow-2xl">
            <ScrapbookPage
              page={activePage}
              pageNumber={pages.findIndex(p => p.id === activeId) + 1}
              onCaptionChange={onCaptionChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
