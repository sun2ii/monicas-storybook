'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Photo } from '@/lib/types/photo';
import DuplicateList from '@/components/duplicates/DuplicateList';
import Navigation from '@/components/Navigation';

export default function DuplicatesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenPhotos, setHiddenPhotos] = useState<Set<string>>(new Set());

  // Fetch photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/photos?userId=user-001');
        const data = await response.json();
        setPhotos(data.photos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  const handleHidePhoto = (photoId: string) => {
    setHiddenPhotos(prev => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DuplicateList photos={photos} onHidePhoto={handleHidePhoto} />

        {/* CTA to create album */}
        {hiddenPhotos.size > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 mb-4">
              You've cleaned up {hiddenPhotos.size} duplicate{hiddenPhotos.size === 1 ? '' : 's'}.
              Ready to organize your photos?
            </p>
            <Link
              href="/collections"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create an Album
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Demo mode - No files are actually deleted from your storage
          </p>
        </div>
      </footer>
    </div>
  );
}
