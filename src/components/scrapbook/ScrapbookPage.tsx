'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/types/photo';

export interface PageLayout {
  id: string;
  template: 'full-bleed' | 'two-up' | 'grid';
  photos: Photo[];
  caption: string;
}

interface ScrapbookPageProps {
  page: PageLayout;
  pageNumber: number;
  onCaptionChange: (pageId: string, caption: string) => void;
  isPrintPreview?: boolean;
}

export default function ScrapbookPage({
  page,
  pageNumber,
  onCaptionChange,
  isPrintPreview = false,
}: ScrapbookPageProps) {
  const [localCaption, setLocalCaption] = useState(page.caption);

  const handleCaptionBlur = () => {
    onCaptionChange(page.id, localCaption);
  };

  const getGridLayout = () => {
    const photoCount = page.photos.length;

    // Determine grid layout based on photo count
    if (page.template === 'full-bleed') {
      return 'grid-cols-1';
    } else if (page.template === 'two-up') {
      return 'grid-cols-2';
    } else {
      // grid template
      if (photoCount <= 2) return 'grid-cols-2';
      if (photoCount === 3) return 'grid-cols-3';
      return 'grid-cols-2'; // 4+ photos in 2x2 grid
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${
        isPrintPreview
          ? 'aspect-[8.5/11] w-full max-w-2xl mx-auto' // Letter size ratio for print
          : 'aspect-[4/3] w-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Page Number */}
        {!isPrintPreview && (
          <div className="bg-gray-100 px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-700">Page {pageNumber}</p>
          </div>
        )}

        {/* Photos Area */}
        <div
          className={`flex-1 p-6 ${
            page.template === 'full-bleed' ? 'p-0' : ''
          }`}
        >
          <div
            className={`grid ${getGridLayout()} gap-2 h-full`}
          >
            {page.photos.map((photo) => (
              <div
                key={photo.photo_id}
                className={`relative bg-gray-100 rounded overflow-hidden ${
                  page.template === 'full-bleed' ? 'rounded-none' : ''
                }`}
              >
                <Image
                  src={photo.dropbox_url || '/placeholder.png'}
                  alt={photo.dropbox_metadata?.name || 'Photo'}
                  fill
                  className="object-cover"
                  sizes={
                    page.template === 'full-bleed'
                      ? '(max-width: 768px) 100vw, 800px'
                      : '(max-width: 768px) 50vw, 400px'
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Caption Area */}
        <div className="p-4 bg-gray-50 border-t">
          {isPrintPreview ? (
            <p className="text-sm text-gray-800 italic min-h-[40px]">
              {localCaption || 'No caption'}
            </p>
          ) : (
            <textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              onBlur={handleCaptionBlur}
              placeholder="Add a caption for this page..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={2}
            />
          )}
        </div>

        {/* Print Preview Page Number */}
        {isPrintPreview && (
          <div className="text-center py-2 text-xs text-gray-500">
            {pageNumber}
          </div>
        )}
      </div>
    </div>
  );
}
