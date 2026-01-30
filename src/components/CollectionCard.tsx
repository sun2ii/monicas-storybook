'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/lib/types/collection';
import { Photo } from '@/lib/types/photo';

interface CollectionCardProps {
  collection: Collection;
  photos?: Photo[];
}

export default function CollectionCard({ collection, photos = [] }: CollectionCardProps) {
  // Get first 4 photos for preview
  const previewPhotos = photos.slice(0, 4);
  const remainingCount = Math.max(0, photos.length - 4);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/collections/${collection.collection_id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
        {/* Photo Preview Grid */}
        <div className="relative bg-gray-100 aspect-square">
          {previewPhotos.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : previewPhotos.length === 1 ? (
            <div className="relative w-full h-full">
              <Image
                src={previewPhotos[0].dropbox_url || '/placeholder.png'}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              {previewPhotos.map((photo, index) => (
                <div key={photo.photo_id} className="relative">
                  <Image
                    src={photo.dropbox_url || '/placeholder.png'}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 16vw"
                  />
                  {index === 3 && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                collection.type === 'scrapbook'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {collection.type === 'scrapbook' ? 'Scrapbook' : 'Album'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {collection.name}
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </p>

          {/* Tags */}
          {collection.tags && collection.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {collection.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {tag}
                </span>
              ))}
              {collection.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{collection.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Updated {formatDate(collection.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
