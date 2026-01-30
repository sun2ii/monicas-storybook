'use client';

import Image from 'next/image';
import { Photo } from '@/lib/types/photo';

interface PhotoCardProps {
  photo: Photo;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

export default function PhotoCard({
  photo,
  onClick,
  selectable = false,
  selected = false,
  onSelectionChange,
}: PhotoCardProps) {
  return (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow ${
        selected ? 'ring-4 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Photo */}
      <div className="relative aspect-square bg-gray-200">
        <Image
          src={photo.dropbox_url || '/placeholder.png'}
          alt={photo.dropbox_metadata?.name || 'Photo'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <p className="text-sm font-medium text-gray-900 truncate">
          {photo.dropbox_metadata?.name || 'Untitled'}
        </p>

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{photo.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Selection checkbox */}
        {selectable && (
          <div className="mt-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectionChange?.(e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
