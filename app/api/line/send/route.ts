import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { ChatMessage, MessageType } from '@/lib/types';
import { chatEvents } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const { userId, text, type = 'text', mediaUrl, packageId, stickerId, replyTo } = await req.json();

    if (!userId || (!text && !stickerId && !mediaUrl)) {
      return NextResponse.json(
        { error: 'Missing userId, text, or media parameters' },
        { status: 400 }
      );
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const isLiveConfigured = Boolean(
      channelAccessToken && channelAccessToken !== 'your_line_channel_access_token_here'
    );
    const isMockUser = userId.startsWith('U1234567890');

    let isLiveSent = false;
    let errorMessage = '';

    // Prepare LINE Messaging API payload based on message type
    let lineMessagePayload: any = null;
    if (type === 'sticker' && packageId && stickerId) {
      lineMessagePayload = {
        type: 'sticker',
        packageId,
        stickerId,
      };
    } else if (type === 'image' && mediaUrl) {
      lineMessagePayload = {
        type: 'image',
        originalContentUrl: mediaUrl,
        previewImageUrl: mediaUrl,
      };
    } else {
      lineMessagePayload = {
        type: 'text',
        text: text || '',
      };
      // Pass native LINE quoteToken if available so LINE API renders native quote box on user device
      if (replyTo?.quoteToken) {
        lineMessagePayload.quoteToken = replyTo.quoteToken;
      }
    }

    let lineMessageId: string | undefined = undefined;
    let returnedQuoteToken: string | undefined = undefined;

    // Call LINE Push API if token is configured AND it is not a mock user ID
    if (isLiveConfigured && !isMockUser) {
      try {
        const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify({
            to: userId,
            messages: [lineMessagePayload],
          }),
        });

        if (lineRes.ok) {
          isLiveSent = true;
          const lineData = await lineRes.json();
          const sentMsg = lineData.sentMessages?.[0];
          if (sentMsg) {
            lineMessageId = sentMsg.id;
            returnedQuoteToken = sentMsg.quoteToken;
          }
        } else {
          const errorData = await lineRes.json();
          errorMessage = errorData.message || 'Failed to send message via LINE API';
          console.error('LINE Push API Error:', errorData);
        }
      } catch (err: any) {
        errorMessage = err.message || 'Network error calling LINE API';
        console.error('LINE API Call Exception:', err);
      }
    } else if (isLiveConfigured && isMockUser) {
      isLiveSent = false;
    }

    // Save message in local store
    const newMessage: ChatMessage = {
      id: `msg-webchat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lineMessageId: lineMessageId,
      userId,
      sender: 'webchat',
      text: text || (type === 'sticker' ? '[สติกเกอร์]' : type === 'image' ? '[รูปภาพ]' : '[ไฟล์แนบ]'),
      type: type as MessageType,
      mediaUrl,
      packageId,
      stickerId,
      quoteToken: returnedQuoteToken,
      replyTo,
      timestamp: Date.now(),
      status: errorMessage ? 'failed' : 'sent',
      errorDetails: errorMessage || undefined,
    };

    await db.addMessage(newMessage);

    // Broadcast SSE real-time event
    chatEvents.emit('new-message', { userId, message: newMessage });
    chatEvents.emit('user-updated', { userId });

    return NextResponse.json({
      success: true,
      message: newMessage,
      liveSent: isLiveSent,
      note: isMockUser && isLiveConfigured
        ? 'Mock user ID cannot receive real LINE push notifications.'
        : !isLiveConfigured
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
