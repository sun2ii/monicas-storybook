'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { DropboxPhoto } from '@/lib/services/dropbox';
import { DEMO_PHOTOS } from '@/lib/demo/mockPhotos';

export default function DemoViewerPage() {
  const [photos] = useState<DropboxPhoto[]>(DEMO_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<DropboxPhoto | null>(null);

  // Selection and move state (for demonstration)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [movedPhotoIds, setMovedPhotoIds] = useState<Set<string>>(new Set());
  const [hideDuplicates, setHideDuplicates] = useState(false);

  // Toggle photo selection
  function togglePhotoSelection(photoId: string) {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }

  // Demo move to duplicates (just marks as moved)
  function handleMoveToDuplicates() {
    setMovedPhotoIds((prev) => new Set([...prev, ...selectedPhotoIds]));
    setSelectedPhotoIds(new Set());
    alert(`Demo: ${selectedPhotoIds.size} photos marked as duplicates!`);
  }

  // Navigate between photos in modal
  const handleNextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  const handlePreviousPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  // Filter photos based on hide duplicates toggle
  const visiblePhotos = photos.filter(
    (p) => !hideDuplicates || !movedPhotoIds.has(p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
        <strong>Demo Mode</strong> - This is a demonstration with sample photos. No Dropbox connection required.
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Photo Viewer</h1>
            <p className="text-sm text-gray-600">
              Showing {visiblePhotos.length} photo{visiblePhotos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hideDuplicates}
                onChange={(e) => setHideDuplicates(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Hide Duplicates
            </label>
          </div>
        </div>

        {/* Photo Grid */}
        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visiblePhotos.map((photo) => {
              const isSelected = selectedPhotoIds.has(photo.id);
              const isMoved = movedPhotoIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-gray-200 hover:shadow-xl transition-all ${
                    isSelected ? 'ring-4 ring-blue-500' : ''
                  } ${isMoved ? 'ring-4 ring-green-500 opacity-50' : ''}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Selection Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(photo.id);
                    }}
                    disabled={isMoved}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSelected ? (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                    )}
                  </button>

                  {/* Moved Indicator */}
                  {isMoved && (
                    <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm truncate">{photo.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {photos.length > 0 && hideDuplicates
                ? 'All photos have been marked as duplicates'
                : 'No photos available'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button - Move to Duplicates */}
      {selectedPhotoIds.size > 0 && (
        <button
          onClick={handleMoveToDuplicates}
          className="fixed bottom-8 right-8 px-6 py-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105 z-40 flex items-center gap-2 font-semibold"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Move to Duplicates ({selectedPhotoIds.size})
        </button>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
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

            {/* Previous Button */}
            {photos.findIndex((p) => p.id === selectedPhoto.id) > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousPhoto();
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

            {/* Image */}
            <div
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                <p className="text-lg font-semibold">{selectedPhoto.name}</p>
                {selectedPhoto.width && selectedPhoto.height && (
                  <p className="text-sm text-gray-300">
                    {selectedPhoto.width} × {selectedPhoto.height}
                  </p>
                )}
                <p className="text-sm text-gray-300">
                  {(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Next Button */}
            {photos.findIndex((p) => p.id === selectedPhoto.id) <
              photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
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
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Demo photos from Unsplash • Not connected to Dropbox
          </p>
        </div>
      </footer>
    </div>
  );
}
