import { NextRequest, NextResponse } from 'next/server';
import { listPhotos, getTemporaryLink, getThumbnail, DropboxPhoto, withTokenRefresh } from '@/lib/services/dropbox';
import { getSession } from '@/lib/session/auth';
import { getDropboxToken, getDropboxRefreshToken } from '@/lib/config/users';

/**
 * GET /api/dropbox/photos
 *
 * Lists all photos from Dropbox account using authenticated user's token
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
  const folderPath = process.env.DROPBOX_PHOTOS_FOLDER || '/Camera Uploads (1)';

  // Get cursor from query parameters for pagination
  const cursor = request.nextUrl.searchParams.get('cursor');

  if (!token) {
    return NextResponse.json(
      { error: 'User configuration error: No Dropbox token found' },
      { status: 500 }
    );
  }

  try {
    // Track if token was refreshed during any API call
    let tokenWasRefreshed = false;

    // List photos from Dropbox with cursor-based pagination
    // Pass username and refreshToken for automatic token refresh if expired
    const resultOrWrapped = await listPhotos(
      token,
      folderPath,
      cursor || undefined,
      session.username,
      refreshToken
    );

    // Handle wrapped response (with refresh metadata) or direct response
    const result = 'data' in resultOrWrapped ? resultOrWrapped.data : resultOrWrapped;
    if ('tokenRefreshed' in resultOrWrapped && resultOrWrapped.tokenRefreshed) {
      tokenWasRefreshed = true;
    }

    console.log(`Found ${result.photos.length} photos, has_more: ${result.has_more}`);

    // Get temporary links and thumbnails in batches to avoid connection issues
    const BATCH_SIZE = 10;
    const photosWithUrls: DropboxPhoto[] = [];

    for (let i = 0; i < result.photos.length; i += BATCH_SIZE) {
      const batch = result.photos.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          try {
            // Fetch both thumbnail and full URL in parallel
            // Wrap in token refresh to handle expired tokens
            const [thumbnailResult, urlResult] = await Promise.all([
              withTokenRefresh(
                session.username,
                token,
                refreshToken,
                (currentToken) => getThumbnail(currentToken, file.path, 'w256h256')
              ),
              withTokenRefresh(
                session.username,
                token,
                refreshToken,
                (currentToken) => getTemporaryLink(currentToken, file.path)
              ),
            ]);

            // Track if any refresh happened
            if (thumbnailResult.tokenRefreshed || urlResult.tokenRefreshed) {
              tokenWasRefreshed = true;
            }

            return { ...file, thumbnailUrl: thumbnailResult.data, url: urlResult.data };
          } catch (error) {
            console.error(`Failed to get URLs for ${file.path}:`, error);
            return { ...file, url: '', thumbnailUrl: '' };
          }
        })
      );
      photosWithUrls.push(...batchResults);
    }

    // Filter out photos without URLs
    const validPhotos = photosWithUrls.filter((p) => p.url !== '' && p.thumbnailUrl !== '');

    console.log(`Successfully loaded ${validPhotos.length} photos with thumbnails and URLs`);

    // Return photos with pagination info and refresh status
    const response = NextResponse.json({
      photos: validPhotos,
      cursor: result.cursor,
      has_more: result.has_more,
      tokenRefreshed: tokenWasRefreshed,
    });

    // Add header for developer visibility
    if (tokenWasRefreshed) {
      response.headers.set('X-Token-Refreshed', 'true');
    }

    return response;
  } catch (error) {
    console.error('Dropbox API error:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch photos from Dropbox' },
      { status: 500 }
    );
  }
}
