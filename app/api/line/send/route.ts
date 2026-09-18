import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, text } = await req.json();

    if (!userId || !text) {
      return NextResponse.json(
        { error: 'Missing userId or text parameter' },
        { status: 400 }
      );
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    let isLiveSent = false;
    let errorMessage = '';

    // If channel access token is configured, call LINE Push Message API
    if (channelAccessToken && !channelAccessToken.includes('your_line')) {
      try {
        const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify({
            to: userId,
            messages: [
              {
                type: 'text',
                text: text,
              },
            ],
          }),
        });

        if (lineRes.ok) {
          isLiveSent = true;
        } else {
          const errorData = await lineRes.json();
          errorMessage = errorData.message || 'Failed to send message via LINE API';
          console.error('LINE Push API Error:', errorData);
        }
      } catch (err: any) {
        errorMessage = err.message || 'Network error calling LINE API';
        console.error('LINE API Call Exception:', err);
      }
    }

    // Save message in local store
    const newMessage: ChatMessage = {
      id: `msg-webchat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sender: 'webchat',
      text,
      timestamp: Date.now(),
      status: errorMessage ? 'failed' : 'sent',
      errorDetails: errorMessage || undefined,
    };

    db.addMessage(newMessage);

    return NextResponse.json({
      success: true,
      message: newMessage,
      liveSent: isLiveSent,
      note: !isLiveSent && !channelAccessToken
        ? 'Saved in Webchat DB. Set LINE_CHANNEL_ACCESS_TOKEN to push to real LINE user.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Send API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
