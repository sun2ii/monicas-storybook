'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Photo } from '@/lib/types/photo';
import { Collection } from '@/lib/types/collection';

interface SortablePhotoProps {
  photo: Photo;
  onRemove?: () => void;
}

function SortablePhoto({ photo, onRemove }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.photo_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group cursor-move"
    >
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
        <Image
          src={photo.dropbox_url || '/placeholder.png'}
          alt={photo.dropbox_metadata?.name || 'Photo'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1 truncate">
        {photo.dropbox_metadata?.name || 'Untitled'}
      </p>
    </div>
  );
}

interface CollectionEditorProps {
  collection: Collection;
  collectionPhotos: Photo[];
  availablePhotos: Photo[];
  onAddPhotos: (photoIds: string[]) => Promise<void>;
  onRemovePhotos: (photoIds: string[]) => Promise<void>;
  onReorder: (photoIds: string[]) => Promise<void>;
}

export default function CollectionEditor({
  collection,
  collectionPhotos,
  availablePhotos,
  onAddPhotos,
  onRemovePhotos,
  onReorder,
}: CollectionEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localCollectionPhotos, setLocalCollectionPhotos] = useState(collectionPhotos);

  const activePhoto = activeId
    ? [...localCollectionPhotos, ...availablePhotos].find(p => p.photo_id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activePhotoId = active.id as string;
    const isInCollection = localCollectionPhotos.some(p => p.photo_id === activePhotoId);

    // If dropped on collection area but not in collection, add it
    if (!isInCollection) {
      await onAddPhotos([activePhotoId]);
      const photoToAdd = availablePhotos.find(p => p.photo_id === activePhotoId);
      if (photoToAdd) {
        setLocalCollectionPhotos([...localCollectionPhotos, photoToAdd]);
      }
    } else if (active.id !== over.id) {
      // Reordering within collection
      const oldIndex = localCollectionPhotos.findIndex(p => p.photo_id === active.id);
      const newIndex = localCollectionPhotos.findIndex(p => p.photo_id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(localCollectionPhotos, oldIndex, newIndex);
        setLocalCollectionPhotos(newOrder);
        await onReorder(newOrder.map(p => p.photo_id));
      }
    }

    setActiveId(null);
  };

  const handleRemove = async (photoId: string) => {
    await onRemovePhotos([photoId]);
    setLocalCollectionPhotos(localCollectionPhotos.filter(p => p.photo_id !== photoId));
  };

  const handleAddClick = async (photoId: string) => {
    await onAddPhotos([photoId]);
    const photoToAdd = availablePhotos.find(p => p.photo_id === photoId);
    if (photoToAdd) {
      setLocalCollectionPhotos([...localCollectionPhotos, photoToAdd]);
    }
  };

  // Filter out photos already in collection
  const filteredAvailablePhotos = availablePhotos.filter(
    p => !localCollectionPhotos.some(cp => cp.photo_id === p.photo_id)
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Photos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Available Photos
          </h2>

          {filteredAvailablePhotos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              All photos have been added to this collection
            </p>
          ) : (
            <SortableContext
              items={filteredAvailablePhotos.map(p => p.photo_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredAvailablePhotos.map((photo) => (
                  <div key={photo.photo_id} className="relative group">
                    <SortablePhoto photo={photo} />
                    <button
                      onClick={() => handleAddClick(photo.photo_id)}
                      className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Collection Photos */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            In Collection ({localCollectionPhotos.length})
          </h2>

          {localCollectionPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-blue-300 rounded-lg">
              <svg
                className="mx-auto w-12 h-12 text-blue-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-blue-600 font-medium">Drag photos here</p>
              <p className="text-blue-500 text-sm mt-1">
                Or click the + button on photos
              </p>
            </div>
          ) : (
            <SortableContext
              items={localCollectionPhotos.map(p => p.photo_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {localCollectionPhotos.map((photo) => (
                  <SortablePhoto
                    key={photo.photo_id}
                    photo={photo}
                    onRemove={() => handleRemove(photo.photo_id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePhoto ? (
          <div className="relative aspect-square w-32 bg-white rounded-lg shadow-xl opacity-90">
            <Image
              src={activePhoto.dropbox_url || '/placeholder.png'}
              alt={activePhoto.dropbox_metadata?.name || 'Photo'}
              fill
              className="object-cover rounded-lg"
              sizes="128px"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
