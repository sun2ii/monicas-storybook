import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // For Phase 1-5, use hardcoded user ID
    // Phase 4+: Extract from session/auth
    const userId = searchParams.get('userId') || 'user-001';

    // Parse filters
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm') || undefined;

    const filters: any = {};

    if (tags && tags.length > 0) {
      filters.tags = tags;
    }

    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }

    const photos = await dataProvider.getPhotos(userId, filters);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const photo = await dataProvider.createPhoto(body);

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}
