'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/types/photo';
import { analyzeAspectRatios } from '@/lib/utils/aspectRatioUtils';

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
  forPdf?: boolean;
}

export default function ScrapbookPage({
  page,
  pageNumber,
  onCaptionChange,
  isPrintPreview = false,
  forPdf = false,
}: ScrapbookPageProps) {
  const [localCaption, setLocalCaption] = useState(page.caption);

  const handleCaptionBlur = () => {
    onCaptionChange(page.id, localCaption);
  };

  const getGridLayout = () => {
    const photoCount = page.photos.length;

    // Determine grid layout based on photo count
    if (page.template === 'full-bleed') {
      return { cols: 'grid-cols-1', aspectRatio: null };
    } else if (page.template === 'two-up') {
      return { cols: 'grid-cols-2', aspectRatio: null };
    } else {
      // grid template - use smart aspect ratio analysis for PDF
      if (forPdf && page.photos.length > 0) {
        const analysis = analyzeAspectRatios(page.photos);
        return { cols: analysis.gridLayout.cols, aspectRatio: analysis.gridLayout.aspectRatio };
      }

      // Default layout for web view
      if (photoCount <= 2) return { cols: 'grid-cols-2', aspectRatio: null };
      if (photoCount === 3) return { cols: 'grid-cols-3', aspectRatio: null };
      return { cols: 'grid-cols-2', aspectRatio: null }; // 4+ photos in 2x2 grid
    }
  };

  const gridLayout = getGridLayout();

  return (
    <div
      className={`bg-white ${forPdf ? '' : 'rounded-lg shadow-lg'} overflow-hidden ${
        isPrintPreview
          ? 'aspect-[8.5/11] w-full max-w-2xl mx-auto' // Letter size ratio for print
          : 'aspect-[4/3] w-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Page Number */}
        {!isPrintPreview && !forPdf && (
          <div className="bg-gray-100 px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-700">Page {pageNumber}</p>
          </div>
        )}

        {/* Photos Area */}
        <div
          className={`flex-1 ${page.template === 'full-bleed' ? 'p-0' : 'p-6'}`}
        >
          <div
            className={`grid ${gridLayout.cols} gap-${forPdf ? '3' : '2'} h-full`}
          >
            {page.photos.map((photo) => (
              <div
                key={photo.photo_id}
                className={`relative bg-gray-100 ${forPdf ? '' : 'rounded overflow-hidden'} ${
                  page.template === 'full-bleed' ? 'rounded-none' : ''
                }`}
                style={
                  forPdf && gridLayout.aspectRatio
                    ? { aspectRatio: gridLayout.aspectRatio }
                    : undefined
                }
              >
                {forPdf ? (
                  // Use regular img tag for PDF to avoid Next.js Image issues with html2canvas
                  <img
                    src={photo.dropbox_url || '/placeholder.png'}
                    alt={photo.dropbox_metadata?.name || 'Photo'}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Caption Area */}
        <div className={`p-4 ${forPdf ? 'bg-white' : 'bg-gray-50'} border-t`}>
          {isPrintPreview ? (
            <p className="text-sm text-gray-800 italic text-center min-h-[40px]">
              {localCaption || 'No caption'}
            </p>
          ) : (
            <textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              onBlur={handleCaptionBlur}
              placeholder="Add a caption for this page..."
              className="w-full px-3 py-2 text-sm text-gray-900 font-medium text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
