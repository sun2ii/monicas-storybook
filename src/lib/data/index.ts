import { DataProvider } from './interfaces';
import { MockDataProvider } from './providers/mock';

/**
 * Provider Factory - THE SWAP POINT
 *
 * This function returns the appropriate DataProvider based on environment variable.
 *
 * Phase 1-5: NEXT_PUBLIC_USE_MOCK_DATA=true → MockDataProvider
 * Phase 6+:  NEXT_PUBLIC_USE_MOCK_DATA=false → PostgresDataProvider
 *
 * All app code uses this single instance, so swapping providers is transparent.
 */
function getDataProvider(): DataProvider {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (useMock) {
    return new MockDataProvider();
  }

  // Phase 6: Implement PostgresDataProvider
  // return new PostgresDataProvider();
  throw new Error('PostgresDataProvider not yet implemented. Set NEXT_PUBLIC_USE_MOCK_DATA=true');
}

// Singleton instance - all code uses this
export const dataProvider = getDataProvider();

// Re-export types for convenience
export type { DataProvider } from './interfaces';
export type { Photo, PhotoFilter } from '../types/photo';
export type { Collection } from '../types/collection';
export type { User } from '../types/user';
