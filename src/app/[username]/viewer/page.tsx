'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';
import { DropboxPhoto } from '@/lib/services/dropbox';

export default function UserViewerPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [photos, setPhotos] = useState<DropboxPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<DropboxPhoto | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Total photo count is eventually consistent, not a source of truth.
  // It's an approximation that reconciles asynchronously.
  // User actions update visible state immediately, counts update later.
  const [totalPhotoCount, setTotalPhotoCount] = useState<number | null>(null);
  const [duplicatesCount, setDuplicatesCount] = useState<number | null>(null);

  // Pagination state
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection and move state
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [movingPhotoIds, setMovingPhotoIds] = useState<Set<string>>(new Set());
  const [movedPhotoIds, setMovedPhotoIds] = useState<Set<string>>(new Set());
  const [hideDuplicates, setHideDuplicates] = useState(false);

  // Cache key and expiry (24 hours)
  const CACHE_KEY = `photo_counts_${username}`;
  const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Format number with commas
  function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  // Get cached counts if available and not expired
  function getCachedCounts(): { total: number; duplicates: number } | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { total, duplicates, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > CACHE_EXPIRY_MS) {
        console.log('📦 Cache expired, will fetch fresh counts');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      console.log('✅ Using cached counts:', { total, duplicates });
      return { total, duplicates };
    } catch (err) {
      console.error('Error reading cache:', err);
      return null;
    }
  }

  // Save counts to cache
  function setCachedCounts(total: number, duplicates: number) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        total,
        duplicates,
        timestamp: Date.now(),
      }));
      console.log('💾 Counts cached successfully');
    } catch (err) {
      console.error('Error caching counts:', err);
    }
  }

  async function fetchPhotos(cursor: string | null = null) {
    try {
      setLoading(true);
      setError(null);

      const url = cursor
        ? `/api/dropbox/photos?cursor=${encodeURIComponent(cursor)}`
        : '/api/dropbox/photos';

      const res = await fetch(url);

      if (res.status === 401) {
        // Unauthorized - redirect to login
        router.push('/get-started');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await res.json();
      setPhotos(data.photos);
      setCurrentCursor(data.cursor);
      setHasMore(data.has_more);

      // Show toast if token was refreshed
      if (data.tokenRefreshed) {
        console.log('🔄 Token was refreshed during this request');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Fetch and cache both counts
  // Note: Cache is already checked by caller (useEffect), no need to check again
  async function fetchAndCacheCounts() {
    // Fetch from API
    try {
      console.log('📊 Fetching photo counts from API...');

      // Fetch both counts in parallel
      const [totalRes, duplicatesRes] = await Promise.all([
        fetch('/api/dropbox/photos/count'),
        fetch('/api/dropbox/photos/count?folder=/Camera Uploads (1)/duplicates'),
      ]);

      let totalCount = 0;
      let duplicatesCountValue = 0;

      // Process total count
      if (totalRes.ok) {
        const totalData = await totalRes.json();
        totalCount = totalData.count;
        console.log('✅ Total photo count received:', totalCount);

        if (totalData.tokenRefreshed) {
          console.log('🔄 Token was refreshed during count request');
          setShowToast(true);
        }
      } else {
        console.error('❌ Failed to fetch photo count:', totalRes.status);
      }

      // Process duplicates count
      if (duplicatesRes.ok) {
        const duplicatesData = await duplicatesRes.json();
        duplicatesCountValue = duplicatesData.count;
        console.log('✅ Duplicates count received:', duplicatesCountValue);

        if (duplicatesData.tokenRefreshed) {
          console.log('🔄 Token was refreshed during duplicates count');
          setShowToast(true);
        }
      } else {
        console.log('Duplicates folder not found or empty');
      }

      // Update state
      setTotalPhotoCount(totalCount);
      setDuplicatesCount(duplicatesCountValue);

      // Cache the results
      setCachedCounts(totalCount, duplicatesCountValue);

    } catch (err) {
      console.error('❌ Error fetching photo counts:', err);
      // Set defaults on error
      setTotalPhotoCount(0);
      setDuplicatesCount(0);
    }
  }

  // Initial load - photos first (critical), counts in background (informational)
  useEffect(() => {
    // Synchronously check cache ONCE (instant, non-blocking)
    const cached = getCachedCounts();
    if (cached) {
      setTotalPhotoCount(cached.total);
      setDuplicatesCount(cached.duplicates);
      console.log('✅ Using cached counts immediately');
    }

    // Load photos (critical path - don't wait for anything)
    fetchPhotos();

    // Load counts in background (non-blocking, only if not cached)
    if (!cached) {
      fetchAndCacheCounts();
    }
  }, []);

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

  // Invalidate cache and refresh counts
  async function refreshCounts() {
    console.log('🔄 Invalidating cache and refreshing counts...');
    localStorage.removeItem(CACHE_KEY);
    await fetchAndCacheCounts();
  }

  // Move selected photos to duplicates folder
  async function handleMoveToDuplicates() {
    const selectedPaths = photos
      .filter((p) => selectedPhotoIds.has(p.id))
      .map((p) => p.path);

    if (selectedPaths.length === 0) return;

    // Set moving state
    setMovingPhotoIds(new Set(selectedPhotoIds));
    setSelectedPhotoIds(new Set());

    try {
      const response = await fetch('/api/dropbox/move-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paths: selectedPaths,
          destinationFolder: '/Camera Uploads (1)/duplicates',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move photos');
      }

      const result = await response.json();

      // Mark successfully moved photos
      const successIds = new Set(
        photos.filter((p) => result.success.includes(p.path)).map((p) => p.id)
      );
      setMovedPhotoIds((prev) => new Set([...prev, ...successIds]));

      // Refresh counts after moving (invalidate cache)
      if (result.success.length > 0) {
        refreshCounts();
      }

      // Show notification
      if (result.failed.length > 0) {
        console.error(`${result.failed.length} photos failed to move`);
        alert(`${result.failed.length} photos failed to move. Check console for details.`);
      } else {
        console.log(`${result.success.length} photos moved successfully`);
      }
    } catch (error) {
      console.error('Error moving photos:', error);
      alert('Failed to move photos. Please try again.');
    } finally {
      setMovingPhotoIds(new Set());
    }
  }

  // Pagination navigation
  function handleNextPage() {
    if (!hasMore || !currentCursor) return;

    // Clear selections when changing pages
    setSelectedPhotoIds(new Set());

    // Save current position to history for Previous button
    setCursorHistory([...cursorHistory, currentCursor]);
    setCurrentPage(currentPage + 1);

    // Fetch next page
    fetchPhotos(currentCursor);
  }

  function handlePreviousPage() {
    if (cursorHistory.length === 0) return;

    // Clear selections when changing pages
    setSelectedPhotoIds(new Set());

    // Get previous cursor from history
    const history = [...cursorHistory];
    const prevCursor = history.pop();

    setCursorHistory(history);
    setCurrentPage(currentPage - 1);

    // Fetch previous page
    fetchPhotos(prevCursor || null);
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

  // Filter photos based on hide duplicates toggle
  const visiblePhotos = photos.filter(
    (p) => !hideDuplicates || !movedPhotoIds.has(p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation username={username} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Photos</h1>
            <p className="text-sm text-gray-600">
              {photos.length > 0
                ? totalPhotoCount !== null
                  ? `Page ${currentPage} • Showing ${formatNumber(visiblePhotos.length)} of ${formatNumber(totalPhotoCount)} photo${totalPhotoCount !== 1 ? 's' : ''}`
                  : `Page ${currentPage} • Showing ${formatNumber(visiblePhotos.length)} photo${visiblePhotos.length !== 1 ? 's' : ''}`
                : totalPhotoCount !== null && totalPhotoCount > 0
                ? `${formatNumber(totalPhotoCount)} photo${totalPhotoCount !== 1 ? 's' : ''} available`
                : 'No photos found in your Dropbox'}
            </p>
            {duplicatesCount !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(duplicatesCount)} photo{duplicatesCount !== 1 ? 's' : ''} in duplicates folder
              </p>
            )}
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
              const isMoving = movingPhotoIds.has(photo.id);
              const isMoved = movedPhotoIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-gray-200 hover:shadow-xl transition-all ${
                    isSelected ? 'ring-4 ring-blue-500' : ''
                  } ${isMoved ? 'ring-4 ring-green-500 opacity-50' : ''} ${
                    isMoving ? 'ring-4 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Selection Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(photo.id);
                    }}
                    disabled={isMoving || isMoved}
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

                  {/* Moving/Moved Indicator */}
                  {isMoving && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
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
                ? 'All photos on this page have been moved to duplicates'
                : 'No photos found in your Dropbox account.'}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-900 font-semibold">
            Page {currentPage}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
          >
            Next →
          </button>
        </div>
      </main>

      {/* Floating Action Button - Move to Duplicates */}
      {selectedPhotoIds.size > 0 && (
        <button
          onClick={handleMoveToDuplicates}
          disabled={movingPhotoIds.size > 0}
          className="fixed bottom-8 right-8 px-6 py-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-40 flex items-center gap-2 font-semibold"
        >
          {movingPhotoIds.size > 0 ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Moving...
            </>
          ) : (
            <>
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
            </>
          )}
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
            Photos loaded from your Dropbox account
          </p>
        </div>
      </footer>

      {/* Token Refresh Toast */}
      {showToast && (
        <Toast
          message="Connection refreshed successfully"
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
