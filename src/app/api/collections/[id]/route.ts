import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await dataProvider.getCollection(id);

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Fetch full photo details for photos in collection
    const photos = await Promise.all(
      collection.photo_ids.map(photoId => dataProvider.getPhoto(photoId))
    );

    // Filter out null values (deleted photos)
    const validPhotos = photos.filter(p => p !== null);

    return NextResponse.json({
      collection,
      photos: validPhotos,
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const collection = await dataProvider.updateCollection(id, body);

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dataProvider.deleteCollection(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
