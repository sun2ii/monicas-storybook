'use client';

import { Photo } from '@/lib/types/photo';
import MasonryPhotoCard from './MasonryPhotoCard';
import Masonry from 'react-masonry-css';

interface MasonryPhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  selectable?: boolean;
  selectedPhotos?: string[];
  onSelectionChange?: (photoIds: string[]) => void;
}

const breakpointCols = {
  default: 4,  // lg: 1024px+
  1024: 3,     // md: 768-1024px
  768: 2,      // sm: 640-768px
  640: 1,      // mobile: <640px
};

export default function MasonryPhotoGrid({
  photos,
  onPhotoClick,
  selectable = false,
  selectedPhotos = [],
  onSelectionChange,
}: MasonryPhotoGridProps) {
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
    <Masonry
      breakpointCols={breakpointCols}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {photos.map((photo) => (
        <MasonryPhotoCard
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
    </Masonry>
  );
}
