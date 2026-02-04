import { NextRequest, NextResponse } from 'next/server';
import { batchMoveFiles } from '@/lib/services/dropbox';
import { getSession } from '@/lib/session/auth';
import { getDropboxToken } from '@/lib/config/users';

/**
 * POST /api/dropbox/move-batch
 *
 * Batch move photos to duplicates folder
 * Creates folder if it doesn't exist
 * Returns detailed success/failure info for each file
 * Requires active session
 */
export async function POST(request: NextRequest) {
  // Get session
  const session = await getSession();

  if (!session.isLoggedIn || !session.username) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get token from user config
  const token = getDropboxToken(session.username);

  if (!token) {
    return NextResponse.json(
      { error: 'User configuration error: No Dropbox token found' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { paths, destinationFolder } = body;

    // Validate request
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: paths must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof destinationFolder !== 'string' || !destinationFolder) {
      return NextResponse.json(
        { error: 'Invalid request: destinationFolder is required' },
        { status: 400 }
      );
    }

    console.log(`Moving ${paths.length} files to ${destinationFolder}`);

    // Perform batch move
    const result = await batchMoveFiles(token, paths, destinationFolder);

    // Return results
    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch move error:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to move files' },
      { status: 500 }
    );
  }
}
