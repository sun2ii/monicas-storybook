import { NextRequest, NextResponse } from 'next/server';
import { countPhotos, withTokenRefresh } from '@/lib/services/dropbox';
import { getSession } from '@/lib/session/auth';
import { getDropboxToken, getDropboxRefreshToken } from '@/lib/config/users';

/**
 * GET /api/dropbox/photos/count
 *
 * Get total count of photos in the user's folder
 * Requires active session
 */
export async function GET(request: NextRequest) {
  // Get session
  const session = await getSession();

  if (!session.isLoggedIn || !session.username) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get token and refresh token from user config
  const token = getDropboxToken(session.username);
  const refreshToken = getDropboxRefreshToken(session.username);

  // Get folder path from query params or use default
  const folderParam = request.nextUrl.searchParams.get('folder');
  const folderPath = folderParam || process.env.DROPBOX_PHOTOS_FOLDER || '/Camera Uploads (1)';

  if (!token) {
    return NextResponse.json(
      { error: 'User configuration error: No Dropbox token found' },
      { status: 500 }
    );
  }

  try {
    // Count photos with automatic token refresh
    const { data: count, tokenRefreshed } = await withTokenRefresh(
      session.username,
      token,
      refreshToken,
      (currentToken) => countPhotos(currentToken, folderPath)
    );

    const response = NextResponse.json({
      count,
      folderPath,
      tokenRefreshed,
    });

    // Add header for developer visibility
    if (tokenRefreshed) {
      response.headers.set('X-Token-Refreshed', 'true');
    }

    return response;
  } catch (error) {
    console.error('Photo count error:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to count photos' },
      { status: 500 }
    );
  }
}
