import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // For Phase 1-5, use hardcoded user ID
    const userId = searchParams.get('userId') || 'user-001';
    const type = searchParams.get('type'); // 'album' or 'scrapbook'

    let collections = await dataProvider.getCollections(userId);

    // Filter by type if specified
    if (type) {
      collections = collections.filter(c => c.type === type);
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ensure user_id is set (Phase 1-5: hardcoded)
    if (!body.user_id) {
      body.user_id = 'user-001';
    }

    const collection = await dataProvider.createCollection(body);

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
