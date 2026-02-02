'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Collection } from '@/lib/types/collection';
import { Photo } from '@/lib/types/photo';
import CollectionList from '@/components/CollectionList';
import Navigation from '@/components/Navigation';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [photosMap, setPhotosMap] = useState<Record<string, Photo[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch('/api/collections?userId=user-001');
        const data = await response.json();
        setCollections(data.collections);

        // Fetch photos for each collection
        const photosMapTemp: Record<string, Photo[]> = {};
        for (const collection of data.collections) {
          const photoResponse = await fetch(`/api/collections/${collection.collection_id}`);
          const photoData = await photoResponse.json();
          photosMapTemp[collection.collection_id] = photoData.photos || [];
        }
        setPhotosMap(photosMapTemp);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user-001',
          name: newCollectionName,
          photo_ids: [],
          tags: [],
          type: 'album',
        }),
      });

      const data = await response.json();
      setCollections([...collections, data.collection]);
      setPhotosMap({ ...photosMap, [data.collection.collection_id]: [] });
      setNewCollectionName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionList
          collections={collections}
          photosMap={photosMap}
          onCreateNew={() => setShowCreateModal(true)}
        />
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Collection</h2>

            <div className="mb-4">
              <label
                htmlFor="collectionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Collection Name
              </label>
              <input
                id="collectionName"
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCollection();
                  }
                }}
                placeholder="e.g., Summer Vacation 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim() || creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Phase 2: Collections with drag-drop organization
          </p>
        </div>
      </footer>
    </div>
  );
}
