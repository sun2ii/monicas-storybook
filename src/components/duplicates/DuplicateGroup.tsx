'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/types/photo';

interface DuplicateGroupProps {
  photos: Photo[];
  groupId: string;
  onHidePhoto: (photoId: string) => void;
}

export default function DuplicateGroup({ photos, groupId, onHidePhoto }: DuplicateGroupProps) {
  const [hiddenPhotos, setHiddenPhotos] = useState<Set<string>>(new Set());

  const handleHide = (photoId: string) => {
    setHiddenPhotos(prev => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
    onHidePhoto(photoId);
  };

  const handleKeep = (photoId: string) => {
    setHiddenPhotos(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });
  };

  // Get source from metadata
  const getSource = (photo: Photo) => {
    return (photo.dropbox_metadata as any)?.source || 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Duplicate Group {groupId}
        </h3>
        <p className="text-sm text-gray-600">
          Same file found in multiple locations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => {
          const isHidden = hiddenPhotos.has(photo.photo_id);

          return (
            <div
              key={photo.photo_id}
              className={`border-2 rounded-lg p-4 transition-all duration-500 ${
                isHidden
                  ? 'opacity-30 border-gray-300'
                  : 'opacity-100 border-gray-200 hover:border-indigo-400'
              }`}
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={photo.dropbox_url || '/placeholder.png'}
                  alt={photo.dropbox_metadata?.name || 'Photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Metadata */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {photo.dropbox_metadata?.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getSource(photo) === 'Dropbox'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      {getSource(photo) === 'Dropbox' ? (
                        <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/>
                      ) : (
                        <path d="M21.71 7.99a5.5 5.5 0 00-9.9 0l-1.1 2.2a5.5 5.5 0 000 4.96l1.1 2.2a5.5 5.5 0 009.9 0l1.1-2.2a5.5 5.5 0 000-4.96l-1.1-2.2z"/>
                      )}
                    </svg>
                    {getSource(photo)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {photo.file_size ? ((photo.file_size / 1024 / 1024).toFixed(2) + ' MB') : 'Unknown size'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isHidden ? (
                  <button
                    onClick={() => handleKeep(photo.photo_id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Keep Visible
                  </button>
                ) : (
                  <button
                    onClick={() => handleHide(photo.photo_id)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hide
                  </button>
                )}
              </div>

              {isHidden && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hidden from view (file not deleted)
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
