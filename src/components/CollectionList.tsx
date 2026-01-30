'use client';

import { Collection } from '@/lib/types/collection';
import { Photo } from '@/lib/types/photo';
import CollectionCard from './CollectionCard';

interface CollectionListProps {
  collections: Collection[];
  photosMap: Record<string, Photo[]>; // Map collection_id to photos
  onCreateNew: () => void;
}

export default function CollectionList({
  collections,
  photosMap,
  onCreateNew,
}: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto w-24 h-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No collections yet
        </h2>
        <p className="text-gray-600 mb-6">
          Create your first collection to organize your photos
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Button */}
      <div>
        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
        >
          <svg
            className="w-5 h-5"
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
          Create New Collection
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.collection_id}
            collection={collection}
            photos={photosMap[collection.collection_id] || []}
          />
        ))}
      </div>
    </div>
  );
}
