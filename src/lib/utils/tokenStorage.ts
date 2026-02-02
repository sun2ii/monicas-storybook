/**
 * Token Storage Utilities
 *
 * Phase 4: Uses localStorage (browser-only)
 * Phase 6: Will migrate to database storage
 */

const TOKEN_KEY = 'dropbox_access_token';

/**
 * Check if code is running in browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Save access token to localStorage
 */
export function saveToken(token: string): void {
  if (!isBrowser) return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
    throw new Error('Failed to save access token');
  }
}

/**
 * Get access token from localStorage
 */
export function getToken(): string | null {
  if (!isBrowser) return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

/**
 * Remove access token from localStorage
 */
export function removeToken(): void {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

/**
 * Check if user has a stored token
 */
export function hasToken(): boolean {
  return getToken() !== null;
}

/**
 * Validate token format (basic check)
 * Can customize validation based on your token format
 */
export function isValidTokenFormat(token: string): boolean {
  // Basic check - just ensure it's not empty
  // Add custom validation logic here based on your token format
  return token.trim().length > 0;
}
