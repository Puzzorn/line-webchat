import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

    if (!channelAccessToken || channelAccessToken.includes('your_line')) {
      return NextResponse.json({
        displayName: 'LINE Official Account',
        pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=LineOA',
        isLive: false,
      });
    }

    const res = await fetch('https://api.line.me/v2/bot/info', {
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        displayName: data.displayName || 'LINE Official Account',
        pictureUrl: data.pictureUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=LineOA',
        basicId: data.basicId,
        premiumId: data.premiumId,
        isLive: true,
      });
    }

    return NextResponse.json({
      displayName: 'LINE Official Account',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=LineOA',
      isLive: false,
    });
  } catch (error: any) {
    console.error('Error fetching LINE OA Info:', error);
    return NextResponse.json({
      displayName: 'LINE Official Account',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=LineOA',
      isLive: false,
    });
  }
}
