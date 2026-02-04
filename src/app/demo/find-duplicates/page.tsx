'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Photo } from '@/lib/types/photo';
import DuplicateList from '@/components/duplicates/DuplicateList';
import { DEMO_PHOTOS } from '@/lib/demo/mockPhotos';

export default function DemoFindDuplicatesPage() {
  // Convert demo photos to Photo type with hash values for duplicate detection
  const [photos] = useState<Photo[]>(() => {
    return DEMO_PHOTOS.map((photo, index) => ({
      photo_id: photo.id,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 'demo-user',
      dropbox_file_id: photo.id,
      dropbox_url: photo.url,
      dropbox_metadata: {
        name: photo.name,
        source: 'demo',
        path: photo.path,
      },
      file_size: photo.size,
      source: ['demo'],
      width: photo.width,
      height: photo.height,
      // Create some duplicates for demo purposes
      // Photos 11 and 14 have the same URL, so give them the same hash
      hash: photo.id === 'demo-11' || photo.id === 'demo-14'
        ? 'hash-duplicate-1'
        : photo.id === 'demo-2' || photo.id === 'demo-8'
        ? 'hash-duplicate-2'
        : `hash-${photo.id}`,
    }));
  });

  const [hiddenPhotos, setHiddenPhotos] = useState<Set<string>>(new Set());

  const handleHidePhoto = (photoId: string) => {
    setHiddenPhotos((prev) => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
        <strong>Demo Mode</strong> - This is a demonstration with sample photos. No Dropbox connection required.
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Duplicates</h1>
          <p className="text-sm text-gray-600">
            Identifying duplicate photos to help you clean up your library
          </p>
        </div>

        <DuplicateList photos={photos} onHidePhoto={handleHidePhoto} />

        {/* CTA */}
        {hiddenPhotos.size > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 mb-4">
              You've identified {hiddenPhotos.size} duplicate{hiddenPhotos.size === 1 ? '' : 's'}.
              Ready to organize your photos?
            </p>
            <a
              href="/demo/collections"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create a Collection
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Demo mode - Showing sample duplicate detection
          </p>
        </div>
      </footer>
    </div>
  );
}
