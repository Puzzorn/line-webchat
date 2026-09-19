import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, markAsReadToken: providedToken } = await req.json();

    let targetToken = providedToken;

    // If markAsReadToken is not explicitly passed, find latest from DB for userId
    if (!targetToken && userId) {
      const messages = await db.getMessages(userId);
      const userMessagesWithToken = messages
        .filter((m) => m.sender === 'user' && m.markAsReadToken)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (userMessagesWithToken.length > 0) {
        targetToken = userMessagesWithToken[0].markAsReadToken;
      }
    }

    if (!targetToken) {
      return NextResponse.json(
        { success: true, message: 'No markAsReadToken available to send' },
        { status: 200 }
      );
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken || channelAccessToken.includes('YOUR_')) {
      return NextResponse.json(
        { success: true, mode: 'demo', message: 'Marked as read in demo mode' },
        { status: 200 }
      );
    }

    // Call official LINE Messaging API POST /v2/bot/chat/markAsRead
    const res = await fetch('https://api.line.me/v2/bot/chat/markAsRead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        markAsReadToken: targetToken,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('LINE markAsRead Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to mark as read on LINE API', details: errorText },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully marked message as read on LINE' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Mark as read API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
