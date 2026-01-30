import { Photo, PhotoFilter } from '../types/photo';
import { Collection } from '../types/collection';
import { User } from '../types/user';

/**
 * DataProvider Interface
 *
 * This is the core abstraction that enables swapping between mock and real database.
 * Both MockDataProvider and PostgresDataProvider implement this interface.
 *
 * Swap is controlled by NEXT_PUBLIC_USE_MOCK_DATA environment variable.
 */
export interface DataProvider {
  // Photos
  getPhotos(userId: string, filters?: PhotoFilter): Promise<Photo[]>;
  getPhoto(photoId: string): Promise<Photo | null>;
  createPhoto(photo: Omit<Photo, 'photo_id' | 'created_at' | 'updated_at'>): Promise<Photo>;
  updatePhoto(photoId: string, updates: Partial<Photo>): Promise<Photo>;
  deletePhoto(photoId: string): Promise<void>;

  // Collections
  getCollections(userId: string): Promise<Collection[]>;
  getCollection(collectionId: string): Promise<Collection | null>;
  createCollection(collection: Omit<Collection, 'collection_id' | 'created_at' | 'updated_at'>): Promise<Collection>;
  updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection>;
  deleteCollection(collectionId: string): Promise<void>;
  addPhotosToCollection(collectionId: string, photoIds: string[]): Promise<Collection>;
  removePhotosFromCollection(collectionId: string, photoIds: string[]): Promise<Collection>;

  // Users
  getUser(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'user_id'>): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
}
