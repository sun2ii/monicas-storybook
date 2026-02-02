'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Collection } from '@/lib/types/collection';
import { Photo } from '@/lib/types/photo';
import CollectionEditor from '@/components/CollectionEditor';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionPhotos, setCollectionPhotos] = useState<Photo[]>([]);
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Fetch collection and photos
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch collection with its photos
        const collectionResponse = await fetch(`/api/collections/${resolvedParams.id}`);
        const collectionData = await collectionResponse.json();

        if (collectionData.collection) {
          setCollection(collectionData.collection);
          setCollectionPhotos(collectionData.photos || []);
          setEditedName(collectionData.collection.name);
        }

        // Fetch all available photos
        const photosResponse = await fetch('/api/photos?userId=user-001');
        const photosData = await photosResponse.json();
        setAvailablePhotos(photosData.photos || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id]);

  const handleAddPhotos = async (photoIds: string[]) => {
    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_ids: photoIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      }
    } catch (error) {
      console.error('Error adding photos:', error);
    }
  };

  const handleRemovePhotos = async (photoIds: string[]) => {
    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_ids: photoIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      }
    } catch (error) {
      console.error('Error removing photos:', error);
    }
  };

  const handleReorder = async (photoIds: string[]) => {
    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_ids: photoIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      }
    } catch (error) {
      console.error('Error reordering photos:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;

    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection? Photos will not be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/collections');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Collection not found</p>
          <Link
            href="/collections"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/collections"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to collections
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateName();
                      } else if (e.key === 'Escape') {
                        setIsEditing(false);
                        setEditedName(collection.name);
                      }
                    }}
                    className="text-3xl font-bold border-b-2 border-blue-500 focus:outline-none px-2"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    className="text-green-600 hover:text-green-800"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(collection.name);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}

              <p className="text-gray-600 mt-1">
                {collectionPhotos.length} {collectionPhotos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/scrapbook/${collection.collection_id}`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View as Scrapbook
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Drag and drop</strong> photos from the left to organize your collection, or click the <strong>+</strong> button to add them.
          </p>
        </div>

        <CollectionEditor
          collection={collection}
          collectionPhotos={collectionPhotos}
          availablePhotos={availablePhotos}
          onAddPhotos={handleAddPhotos}
          onRemovePhotos={handleRemovePhotos}
          onReorder={handleReorder}
        />
      </main>
    </div>
  );
}
