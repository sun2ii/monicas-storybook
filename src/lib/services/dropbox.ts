/**
 * Dropbox API Service
 *
 * Simple wrapper for Dropbox API v2 to list photos and get temporary download links
 */

export interface DropboxPhoto {
  id: string;           // Dropbox file ID
  name: string;         // Filename
  path: string;         // Full path in Dropbox
  url: string;          // Temporary download link (4-hour TTL)
  thumbnailUrl?: string; // Thumbnail data URL (256x256)
  width?: number;       // From media_info
  height?: number;      // From media_info
  size: number;         // File size in bytes
}

export interface DropboxPhotoResponse {
  photos: Omit<DropboxPhoto, 'url'>[];
  cursor?: string;
  has_more: boolean;
}

interface DropboxFileMetadata {
  '.tag': string;
  id: string;
  name: string;
  path_display: string;
  size: number;
  media_info?: {
    '.tag': string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
      };
    };
  };
}

interface ListFolderResponse {
  entries: DropboxFileMetadata[];
  has_more: boolean;
  cursor?: string;
}

interface TemporaryLinkResponse {
  link: string;
}

interface FolderMetadataResponse {
  '.tag': string;
  name: string;
  path_display: string;
}

interface MoveFileResponse {
  metadata: {
    '.tag': string;
    name: string;
    path_display: string;
    id: string;
  };
}

interface CreateFolderResponse {
  metadata: {
    '.tag': string;
    name: string;
    path_display: string;
    id: string;
  };
}

export interface BatchMoveResult {
  success: string[];
  failed: Array<{ path: string; error: string }>;
  folderCreated: boolean;
}

const DROPBOX_API_BASE = 'https://api.dropboxapi.com/2';
const DROPBOX_CONTENT_API_BASE = 'https://content.dropboxapi.com/2';

// Supported image file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.gif', '.webp', '.bmp', '.tiff'];

/**
 * Check if filename is an image based on extension
 */
function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * List photos from Dropbox with cursor-based pagination
 * Keeps fetching until we have at least 100 photos or run out of results
 */
export async function listPhotos(
  accessToken: string,
  folderPath: string = '',
  cursor?: string
): Promise<DropboxPhotoResponse> {
  const allPhotos: Omit<DropboxPhoto, 'url'>[] = [];
  let currentCursor = cursor;
  let hasMore = true;

  // Keep fetching pages until we have 50 photos or run out
  while (allPhotos.length < 50 && hasMore) {
    const response = await fetch(
      currentCursor
        ? `${DROPBOX_API_BASE}/files/list_folder/continue`
        : `${DROPBOX_API_BASE}/files/list_folder`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          currentCursor
            ? { cursor: currentCursor }
            : {
                path: folderPath,
                recursive: true,
                include_media_info: true,
              }
        ),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error: ${response.status} - ${error}`);
    }

    const data: ListFolderResponse = await response.json();

    console.log(`Fetched ${data.entries.length} entries from Dropbox`);

    // Filter for image files based on file extension
    const photos = data.entries.filter(
      (file) => file['.tag'] === 'file' && isImageFile(file.name)
    );

    console.log(`Found ${photos.length} photos in this batch`);

    // Add photos to our collection
    allPhotos.push(...photos.map((file) => ({
      id: file.id,
      name: file.name,
      path: file.path_display,
      url: '', // Will be filled by getTemporaryLink
      width: file.media_info?.metadata?.dimensions?.width,
      height: file.media_info?.metadata?.dimensions?.height,
      size: file.size,
    })));

    hasMore = data.has_more;
    currentCursor = data.cursor;
  }

  console.log(`Total photos accumulated: ${allPhotos.length}`);

  // Return up to 50 photos with pagination info
  return {
    photos: allPhotos.slice(0, 50),
    cursor: currentCursor,
    has_more: hasMore || allPhotos.length > 50,
  };
}

/**
 * Get temporary download link for a Dropbox file
 * Links are valid for 4 hours
 */
export async function getTemporaryLink(
  accessToken: string,
  path: string
): Promise<string> {
  const response = await fetch(`${DROPBOX_API_BASE}/files/get_temporary_link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox API error: ${response.status} - ${error}`);
  }

  const data: TemporaryLinkResponse = await response.json();
  return data.link;
}

/**
 * Get thumbnail for a photo (returns base64 data URL)
 * Sizes: w32h32, w64h64, w128h128, w256h256, w480h320, w640h480, w960h640, w1024h768, w2048h1536
 */
export async function getThumbnail(
  accessToken: string,
  path: string,
  size: 'w256h256' | 'w640h480' = 'w256h256'
): Promise<string> {
  const response = await fetch(`${DROPBOX_CONTENT_API_BASE}/files/get_thumbnail_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({
        resource: {
          '.tag': 'path',
          path: path,
        },
        format: 'jpeg',
        size: size,
        mode: 'strict',
      }),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox thumbnail error: ${response.status} - ${error}`);
  }

  // Convert blob to base64 data URL
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Check if a folder exists in Dropbox
 */
export async function folderExists(
  accessToken: string,
  path: string
): Promise<boolean> {
  try {
    const response = await fetch(`${DROPBOX_API_BASE}/files/get_metadata`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      return false;
    }

    const data: FolderMetadataResponse = await response.json();
    return data['.tag'] === 'folder';
  } catch {
    return false;
  }
}

/**
 * Create a folder in Dropbox
 */
export async function createFolder(
  accessToken: string,
  path: string
): Promise<void> {
  const response = await fetch(`${DROPBOX_API_BASE}/files/create_folder_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path,
      autorename: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    // Ignore 409 conflict if folder already exists
    if (response.status === 409) {
      console.log(`Folder ${path} already exists, continuing...`);
      return;
    }
    throw new Error(`Dropbox API error: ${response.status} - ${error}`);
  }

  const data: CreateFolderResponse = await response.json();
  console.log(`Created folder: ${data.metadata.path_display}`);
}

/**
 * Move a file to a different location in Dropbox
 */
export async function moveFile(
  accessToken: string,
  fromPath: string,
  toPath: string
): Promise<void> {
  const response = await fetch(`${DROPBOX_API_BASE}/files/move_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_path: fromPath,
      to_path: toPath,
      autorename: false,
      allow_ownership_transfer: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox API error: ${response.status} - ${error}`);
  }

  const data: MoveFileResponse = await response.json();
  console.log(`Moved file: ${fromPath} → ${data.metadata.path_display}`);
}

/**
 * Batch move files to a destination folder
 * Creates the destination folder if it doesn't exist
 * Returns list of successful and failed moves
 */
export async function batchMoveFiles(
  accessToken: string,
  filePaths: string[],
  destinationFolder: string
): Promise<BatchMoveResult> {
  let folderCreated = false;

  // Check if destination folder exists, create if not
  const exists = await folderExists(accessToken, destinationFolder);
  if (!exists) {
    console.log(`Destination folder doesn't exist, creating: ${destinationFolder}`);
    await createFolder(accessToken, destinationFolder);
    folderCreated = true;
  }

  const success: string[] = [];
  const failed: Array<{ path: string; error: string }> = [];

  // Move files sequentially to avoid rate limiting
  for (const filePath of filePaths) {
    const fileName = filePath.split('/').pop() || '';
    const toPath = `${destinationFolder}/${fileName}`;

    try {
      await moveFile(accessToken, filePath, toPath);
      success.push(filePath);
    } catch (error) {
      console.error(`Failed to move ${filePath}:`, error);
      failed.push({
        path: filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log(`Batch move complete: ${success.length} succeeded, ${failed.length} failed`);

  return { success, failed, folderCreated };
}
