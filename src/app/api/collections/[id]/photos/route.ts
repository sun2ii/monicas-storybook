import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.photo_ids || !Array.isArray(body.photo_ids)) {
      return NextResponse.json(
        { error: 'photo_ids array is required' },
        { status: 400 }
      );
    }

    const collection = await dataProvider.addPhotosToCollection(
      id,
      body.photo_ids
    );

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error adding photos to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add photos to collection' },
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
    const body = await request.json();

    if (!body.photo_ids || !Array.isArray(body.photo_ids)) {
      return NextResponse.json(
        { error: 'photo_ids array is required' },
        { status: 400 }
      );
    }

    const collection = await dataProvider.removePhotosFromCollection(
      id,
      body.photo_ids
    );

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error removing photos from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove photos from collection' },
      { status: 500 }
    );
  }
}
