'use client';

import { Photo } from '@/lib/types/photo';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  selectable?: boolean;
  selectedPhotos?: string[];
  onSelectionChange?: (photoIds: string[]) => void;
}

export default function PhotoGrid({
  photos,
  onPhotoClick,
  selectable = false,
  selectedPhotos = [],
  onSelectionChange,
}: PhotoGridProps) {
  const handlePhotoSelect = (photoId: string, selected: boolean) => {
    if (!onSelectionChange) return;

    if (selected) {
      onSelectionChange([...selectedPhotos, photoId]);
    } else {
      onSelectionChange(selectedPhotos.filter((id) => id !== photoId));
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No photos found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or add some photos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.photo_id}
          photo={photo}
          onClick={() => onPhotoClick?.(photo)}
          selectable={selectable}
          selected={selectedPhotos.includes(photo.photo_id)}
          onSelectionChange={(selected) =>
            handlePhotoSelect(photo.photo_id, selected)
          }
        />
      ))}
    </div>
  );
}
