'use client';

import { Photo } from '@/lib/types/photo';
import DuplicateGroup from './DuplicateGroup';

interface DuplicateListProps {
  photos: Photo[];
  onHidePhoto: (photoId: string) => void;
}

export default function DuplicateList({ photos, onHidePhoto }: DuplicateListProps) {
  // Group photos by hash to find duplicates
  const duplicateGroups = photos.reduce((groups, photo) => {
    if (!photo.hash) return groups; // Skip photos without hash
    if (!groups[photo.hash]) {
      groups[photo.hash] = [];
    }
    groups[photo.hash].push(photo);
    return groups;
  }, {} as Record<string, Photo[]>);

  // Filter to only groups with 2+ photos (actual duplicates)
  const actualDuplicates = Object.entries(duplicateGroups)
    .filter(([_, photos]) => photos.length > 1)
    .map(([hash, photos], index) => ({
      id: `group-${index + 1}`,
      hash,
      photos,
    }));

  if (actualDuplicates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-green-600">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No duplicates found!
        </h3>
        <p className="text-gray-600">
          All your photos are unique across your storage providers.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-indigo-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 text-indigo-600 mt-0.5">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Found {actualDuplicates.length} duplicate {actualDuplicates.length === 1 ? 'group' : 'groups'}
            </h3>
            <p className="text-sm text-gray-700">
              These photos appear in multiple storage locations. Choose which version to keep
              visible in your gallery. Hiding a photo won't delete it from your storage.
            </p>
          </div>
        </div>
      </div>

      {actualDuplicates.map((group) => (
        <DuplicateGroup
          key={group.id}
          groupId={group.id}
          photos={group.photos}
          onHidePhoto={onHidePhoto}
        />
      ))}
    </div>
  );
}
