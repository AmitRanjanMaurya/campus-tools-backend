import { NextRequest, NextResponse } from 'next/server';

// Simulated database for mind map sharing
const sharedMaps = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'share':
        const shareId = generateShareId();
        sharedMaps.set(shareId, {
          ...data,
          shareId,
          createdAt: new Date().toISOString(),
          views: 0
        });
        
        return NextResponse.json({
          success: true,
          shareId,
          shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tools/mind-map/shared/${shareId}`
        });

      case 'get':
        const { shareId: getShareId } = data;
        const mindMap = sharedMaps.get(getShareId);
        
        if (!mindMap) {
          return NextResponse.json(
            { error: 'Mind map not found' },
            { status: 404 }
          );
        }

        // Increment view count
        mindMap.views += 1;
        sharedMaps.set(getShareId, mindMap);

        return NextResponse.json({
          success: true,
          mindMap
        });

      case 'list-public':
        const publicMaps = Array.from(sharedMaps.values())
          .filter(map => map.isPublic)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20); // Limit to 20 maps

        return NextResponse.json({
          success: true,
          maps: publicMaps.map(map => ({
            shareId: map.shareId,
            title: map.title,
            description: map.description,
            createdAt: map.createdAt,
            views: map.views,
            nodeCount: Object.keys(map.nodes || {}).length
          }))
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mind map collaboration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const mindMap = sharedMaps.get(shareId);
    
    if (!mindMap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      );
    }

    // Increment view count
    mindMap.views += 1;
    sharedMaps.set(shareId, mindMap);

    return NextResponse.json({
      success: true,
      mindMap
    });
  } catch (error) {
    console.error('Get shared mind map error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
