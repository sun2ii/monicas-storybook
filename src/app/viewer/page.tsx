'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Photo } from '@/lib/types/photo';
import PhotoGrid from '@/components/PhotoGrid';
import FilterBar from '@/components/FilterBar';
import PhotoViewer from '@/components/PhotoViewer';

export default function ViewerPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Fetch photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/photos?userId=user-001');
        const data = await response.json();
        setPhotos(data.photos);
        setFilteredPhotos(data.photos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = photos;

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((photo) =>
        selectedTags.some((tag) => photo.tags.includes(tag))
      );
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((photo) => {
        const photoDate = new Date(photo.created_at);
        return photoDate >= start && photoDate <= end;
      });
    }

    setFilteredPhotos(result);
  }, [photos, selectedTags, dateRange]);

  // Get all unique tags
  const availableTags = Array.from(
    new Set(photos.flatMap((photo) => photo.tags))
  ).sort();

  // Navigate between photos in modal
  const handleNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.photo_id === selectedPhoto.photo_id
    );
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.photo_id === selectedPhoto.photo_id
    );
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setDateRange({ start: '', end: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Back to home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Photo Viewer</h1>
              <p className="text-gray-600 mt-1">
                {filteredPhotos.length} of {photos.length} photos
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/collections"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Collections
              </Link>
              <Link
                href="/duplicates"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Find Duplicates
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <FilterBar
          availableTags={availableTags}
          selectedTags={selectedTags}
          dateRange={dateRange}
          onTagsChange={setSelectedTags}
          onDateRangeChange={setDateRange}
          onClearFilters={handleClearFilters}
        />

        {/* Photo Grid */}
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setSelectedPhoto}
        />

        {/* Photo Modal */}
        <PhotoViewer
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Phase 1: Using mock data | Mode:{' '}
            {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'Mock' : 'Database'}
          </p>
        </div>
      </footer>
    </div>
  );
}
