'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

interface DemoCollection {
  id: string;
  name: string;
  photoCount: number;
  coverImage: string;
}

export default function DemoCollectionsPage() {
  const [collections, setCollections] = useState<DemoCollection[]>([
    {
      id: 'demo-collection-1',
      name: 'Nature Landscapes',
      photoCount: 8,
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=256&h=256&fit=crop',
    },
    {
      id: 'demo-collection-2',
      name: 'Urban Exploration',
      photoCount: 5,
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=256&h=256&fit=crop',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: DemoCollection = {
      id: `demo-collection-${Date.now()}`,
      name: newCollectionName,
      photoCount: 0,
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=256&h=256&fit=crop',
    };

    setCollections([...collections, newCollection]);
    setNewCollectionName('');
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
        <strong>Demo Mode</strong> - This is a demonstration with sample collections. No Dropbox connection required.
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections</h1>
            <p className="text-sm text-gray-600">
              Organize your photos into albums and collections
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={collection.coverImage}
                    alt={collection.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{collection.name}</h3>
                  <p className="text-sm text-gray-600">
                    {collection.photoCount} photo{collection.photoCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first collection to organize your photos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Collection
            </button>
          </div>
        )}
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
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Demo mode - Showing sample collections
          </p>
        </div>
      </footer>
    </div>
  );
}
