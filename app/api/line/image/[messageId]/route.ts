import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    if (!channelAccessToken || channelAccessToken.includes('your_line')) {
      // Mock fallback image if token is not set
      return NextResponse.redirect('https://api.dicebear.com/7.x/shapes/svg?seed=placeholder');
    }

    const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Failed to fetch image for message ${messageId}: ${res.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch image content from LINE API' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Image Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
