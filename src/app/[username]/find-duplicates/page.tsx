'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { DropboxPhoto } from '@/lib/services/dropbox';
import { Photo } from '@/lib/types/photo';
import DuplicateList from '@/components/duplicates/DuplicateList';

export default function UserFindDuplicatesPage() {
  const params = useParams();
  const username = params.username as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenPhotos, setHiddenPhotos] = useState<Set<string>>(new Set());

  // Fetch photos from Dropbox and compute hashes for duplicate detection
  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all photos from Dropbox (we'll need to paginate through all of them)
        const allPhotos: DropboxPhoto[] = [];
        let cursor: string | null = null;

        do {
          const url: string = cursor
            ? `/api/dropbox/photos?cursor=${encodeURIComponent(cursor)}`
            : '/api/dropbox/photos';

          const res = await fetch(url);
          if (!res.ok) {
            throw new Error('Failed to fetch photos');
          }

          const data = await res.json();
          allPhotos.push(...data.photos);
          cursor = data.has_more ? data.cursor : null;
        } while (cursor);

        // For duplicate detection, we'll use a simple hash based on file size and name
        // In production, you'd want to use actual image hashing (perceptual hashing)
        const photosWithHashes: Photo[] = allPhotos.map((photo) => {
          // Simple hash: combine file size and last 20 chars of name
          const namePart = photo.name.slice(-20).toLowerCase();
          const hash = `${photo.size}-${namePart}`;

          return {
            photo_id: photo.id,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            owner_id: username,
            dropbox_file_id: photo.id,
            dropbox_url: photo.url,
            dropbox_metadata: {
              name: photo.name,
              source: 'dropbox',
              path: photo.path,
            },
            hash,
            file_size: photo.size,
            source: ['dropbox'],
            width: photo.width,
            height: photo.height,
          };
        });

        setPhotos(photosWithHashes);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [username]);

  const handleHidePhoto = (photoId: string) => {
    setHiddenPhotos((prev) => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing photos for duplicates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation username={username} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Duplicates</h1>
          <p className="text-sm text-gray-600">
            Analyzing {photos.length} photos for duplicates
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
              href={`/${username}/collections`}
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
            Photos loaded from your Dropbox account
          </p>
        </div>
      </footer>
    </div>
  );
}
