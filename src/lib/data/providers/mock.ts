import { DataProvider } from '../interfaces';
import { Photo, PhotoFilter } from '../../types/photo';
import { Collection } from '../../types/collection';
import { User } from '../../types/user';

// Import mock data
import photoData from '@/mocks/photos.json';
import collectionData from '@/mocks/collections.json';
import userData from '@/mocks/users.json';

/**
 * MockDataProvider
 *
 * In-memory implementation of DataProvider interface.
 * Used in Phase 1-5 for development with mock data.
 *
 * Operates on in-memory arrays loaded from JSON files.
 * Changes persist only during the current session.
 */
export class MockDataProvider implements DataProvider {
  private photos: Photo[];
  private collections: Collection[];
  private users: User[];

  constructor() {
    // Deep copy to avoid mutating imported data
    this.photos = JSON.parse(JSON.stringify(photoData)) as Photo[];
    this.collections = JSON.parse(JSON.stringify(collectionData)) as Collection[];
    this.users = JSON.parse(JSON.stringify(userData)) as User[];
  }

  // ============== PHOTOS ==============

  async getPhotos(userId: string, filters?: PhotoFilter): Promise<Photo[]> {
    let filtered = this.photos.filter(p => p.owner_id === userId);

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= filters.dateRange!.start &&
               createdAt <= filters.dateRange!.end;
      });
    }

    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.dropbox_metadata?.name?.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  async getPhoto(photoId: string): Promise<Photo | null> {
    return this.photos.find(p => p.photo_id === photoId) || null;
  }

  async createPhoto(photo: Omit<Photo, 'photo_id' | 'created_at' | 'updated_at'>): Promise<Photo> {
    const newPhoto: Photo = {
      ...photo,
      photo_id: `photo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.photos.push(newPhoto);
    return newPhoto;
  }

  async updatePhoto(photoId: string, updates: Partial<Photo>): Promise<Photo> {
    const index = this.photos.findIndex(p => p.photo_id === photoId);
    if (index === -1) {
      throw new Error(`Photo ${photoId} not found`);
    }

    this.photos[index] = {
      ...this.photos[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.photos[index];
  }

  async deletePhoto(photoId: string): Promise<void> {
    const index = this.photos.findIndex(p => p.photo_id === photoId);
    if (index === -1) {
      throw new Error(`Photo ${photoId} not found`);
    }

    this.photos.splice(index, 1);

    // Remove from collections
    this.collections.forEach(collection => {
      collection.photo_ids = collection.photo_ids.filter(id => id !== photoId);
    });
  }

  // ============== COLLECTIONS ==============

  async getCollections(userId: string): Promise<Collection[]> {
    return this.collections.filter(c => c.user_id === userId);
  }

  async getCollection(collectionId: string): Promise<Collection | null> {
    return this.collections.find(c => c.collection_id === collectionId) || null;
  }

  async createCollection(collection: Omit<Collection, 'collection_id' | 'created_at' | 'updated_at'>): Promise<Collection> {
    const newCollection: Collection = {
      ...collection,
      collection_id: `coll-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.collections.push(newCollection);
    return newCollection;
  }

  async updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection> {
    const index = this.collections.findIndex(c => c.collection_id === collectionId);
    if (index === -1) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    this.collections[index] = {
      ...this.collections[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.collections[index];
  }

  async deleteCollection(collectionId: string): Promise<void> {
    const index = this.collections.findIndex(c => c.collection_id === collectionId);
    if (index === -1) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    this.collections.splice(index, 1);
  }

  async addPhotosToCollection(collectionId: string, photoIds: string[]): Promise<Collection> {
    const collection = await this.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    // Add only photos that aren't already in the collection
    const newPhotoIds = photoIds.filter(id => !collection.photo_ids.includes(id));
    collection.photo_ids.push(...newPhotoIds);
    collection.updated_at = new Date().toISOString();

    return collection;
  }

  async removePhotosFromCollection(collectionId: string, photoIds: string[]): Promise<Collection> {
    const collection = await this.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    collection.photo_ids = collection.photo_ids.filter(id => !photoIds.includes(id));
    collection.updated_at = new Date().toISOString();

    return collection;
  }

  // ============== USERS ==============

  async getUser(userId: string): Promise<User | null> {
    return this.users.find(u => u.user_id === userId) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async createUser(user: Omit<User, 'user_id'>): Promise<User> {
    const newUser: User = {
      ...user,
      user_id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.user_id === userId);
    if (index === -1) {
      throw new Error(`User ${userId} not found`);
    }

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.users[index];
  }
}
