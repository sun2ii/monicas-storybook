'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/types/photo';

interface PhotoViewerProps {
  photo: Photo | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function PhotoViewer({
  photo,
  onClose,
  onNext,
  onPrevious,
}: PhotoViewerProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
    };

    if (photo) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [photo, onClose, onNext, onPrevious]);

  if (!photo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Navigation buttons */}
      {onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 text-white hover:text-gray-300 z-10"
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 text-white hover:text-gray-300 z-10"
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Content */}
      <div
        className="max-w-6xl w-full flex flex-col md:flex-row gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
          <div className="relative w-full h-[70vh]">
            <Image
              src={photo.dropbox_url || '/placeholder.png'}
              alt={photo.dropbox_metadata?.name || 'Photo'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 70vw"
              priority
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="md:w-80 bg-white rounded-lg p-6 overflow-y-auto max-h-[70vh]">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {photo.dropbox_metadata?.name || 'Untitled'}
          </h2>

          <div className="space-y-4">
            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              {photo.tags && photo.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tags</p>
              )}
            </div>

            {/* File Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                File Information
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-600">Size</dt>
                  <dd className="text-gray-900">
                    {formatFileSize(photo.file_size)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Created</dt>
                  <dd className="text-gray-900">{formatDate(photo.created_at)}</dd>
                </div>
                {photo.dropbox_metadata?.client_modified && (
                  <div>
                    <dt className="text-gray-600">Modified</dt>
                    <dd className="text-gray-900">
                      {formatDate(photo.dropbox_metadata.client_modified)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Dropbox Info */}
            {photo.dropbox_file_id && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Dropbox
                </h3>
                <p className="text-xs text-gray-500 font-mono break-all">
                  {photo.dropbox_file_id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
