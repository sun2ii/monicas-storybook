'use client';

import { useState, useEffect } from 'react';
import { Photo } from '@/lib/types/photo';
import MasonryPhotoGrid from '@/components/MasonryPhotoGrid';
import FilterBar from '@/components/FilterBar';
import PhotoViewer from '@/components/PhotoViewer';
import Navigation from '@/components/Navigation';

export default function ViewerPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 20;

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
    setCurrentPage(1); // Reset to page 1 when filters change
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);

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
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredPhotos.length > 0
              ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredPhotos.length)} of ${filteredPhotos.length} photos`
              : 'No photos found'
            }
          </p>
        </div>
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
        <MasonryPhotoGrid
          photos={paginatedPhotos}
          onPhotoClick={setSelectedPhoto}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-900 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
            >
              Next →
            </button>
          </div>
        )}

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
