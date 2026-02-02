'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Collection } from '@/lib/types/collection';
import { Photo } from '@/lib/types/photo';
import ScrapbookEditor from '@/components/scrapbook/ScrapbookEditor';
import PrintPreview from '@/components/scrapbook/PrintPreview';
import { PageLayout } from '@/components/scrapbook/ScrapbookPage';
import { generatePages } from '@/lib/utils/generatePages';

export default function ScrapbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pages, setPages] = useState<PageLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Fetch collection and photos
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/collections/${resolvedParams.id}`);
        const data = await response.json();

        if (data.collection && data.photos) {
          setCollection(data.collection);
          setPhotos(data.photos);

          // Generate pages from photos
          const generatedPages = generatePages(data.photos);
          setPages(generatedPages);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id]);

  const handleCaptionChange = (pageId: string, caption: string) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, caption } : page
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your scrapbook...</p>
        </div>
      </div>
    );
  }

  if (!collection || photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!collection ? 'Collection not found' : 'No photos in collection'}
          </h2>
          <p className="text-gray-600 mb-6">
            {!collection
              ? 'This collection does not exist.'
              : 'Add photos to this collection to create a scrapbook.'}
          </p>
          <Link
            href={collection ? `/collections/${resolvedParams.id}` : '/collections'}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {collection ? 'Add Photos' : 'Back to Collections'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/collections/${resolvedParams.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Back to collection
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
              <p className="text-gray-600 mt-1">
                {pages.length} {pages.length === 1 ? 'page' : 'pages'} • {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintPreview(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Preview Print Layout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
          <p className="text-sm text-purple-800">
            <strong>Drag the handles</strong> on the left to reorder pages. Add captions to tell your story.
          </p>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No pages to display</p>
          </div>
        ) : (
          <ScrapbookEditor
            pages={pages}
            onPagesChange={setPages}
            onCaptionChange={handleCaptionChange}
          />
        )}
      </main>

      {/* Print Preview Modal */}
      {showPrintPreview && collection && (
        <PrintPreview
          pages={pages}
          collectionName={collection.name}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Demo mode - Your memories stay safe in their original storage
          </p>
        </div>
      </footer>
    </div>
  );
}
