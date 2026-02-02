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
  isDuplicate?: boolean;
}

function SortablePhoto({ photo, onRemove, isDuplicate }: SortablePhotoProps) {
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

        {/* Duplicate star badge */}
        {isDuplicate && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full p-1 shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
            type="button"
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
  const [hideDuplicates, setHideDuplicates] = useState(false);

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

  // Detect duplicates by hash
  const hashMap = new Map<string, Photo[]>();
  availablePhotos.forEach(photo => {
    if (photo.hash) {
      const existing = hashMap.get(photo.hash) || [];
      hashMap.set(photo.hash, [...existing, photo]);
    }
  });

  const duplicatePhotoIds = new Set<string>();
  hashMap.forEach((photos) => {
    if (photos.length > 1) {
      photos.forEach(p => duplicatePhotoIds.add(p.photo_id));
    }
  });

  // Filter out photos already in collection
  let filteredAvailablePhotos = availablePhotos.filter(
    p => !localCollectionPhotos.some(cp => cp.photo_id === p.photo_id)
  );

  // Apply hide duplicates filter
  if (hideDuplicates) {
    const seenHashes = new Set<string>();
    filteredAvailablePhotos = filteredAvailablePhotos.filter(photo => {
      if (!photo.hash || !duplicatePhotoIds.has(photo.photo_id)) {
        return true; // Keep photos without hash or non-duplicates
      }
      if (!seenHashes.has(photo.hash)) {
        seenHashes.add(photo.hash);
        return true; // Keep first occurrence
      }
      return false; // Hide subsequent duplicates
    });
  }

  const duplicateCount = availablePhotos.filter(p =>
    duplicatePhotoIds.has(p.photo_id) &&
    !localCollectionPhotos.some(cp => cp.photo_id === p.photo_id)
  ).length;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Photos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Photos
            </h2>

            {duplicateCount > 0 && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideDuplicates}
                  onChange={(e) => setHideDuplicates(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  Hide duplicates ({duplicateCount})
                </span>
              </label>
            )}
          </div>

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
                    <SortablePhoto
                      photo={photo}
                      isDuplicate={duplicatePhotoIds.has(photo.photo_id)}
                    />
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
