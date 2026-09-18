import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ status: 'active', message: 'LINE Webhook endpoint is ready' }, { status: 200 });
}

// Helper to verify LINE HMAC-SHA256 signature
function verifyLineSignature(bodyText: string, channelSecret: string, signature: string): boolean {
  if (!channelSecret || !signature) return false;
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(bodyText)
    .digest('base64');
  return hash === signature;
}

// Fetch LINE User Profile
async function getLineUserProfile(userId: string, channelAccessToken: string) {
  try {
    if (!channelAccessToken || channelAccessToken === 'your_line_channel_access_token_here') {
      return {
        displayName: `LINE User (${userId.slice(0, 6)})`,
        pictureUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      };
    }
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        displayName: data.displayName,
        pictureUrl: data.pictureUrl,
        statusMessage: data.statusMessage,
      };
    }
  } catch (error) {
    console.error('Error fetching LINE user profile:', error);
  }

  return {
    displayName: `LINE User (${userId.slice(0, 6)})`,
    pictureUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature') || '';
    const isInternalSim = req.headers.get('x-internal-simulation') === 'true';

    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const isLiveSecret = Boolean(channelSecret && channelSecret !== 'your_line_channel_secret_here');

    // Verify signature if secret is configured and request is not internal simulation from UI
    if (isLiveSecret && !isInternalSim) {
      const isValid = verifyLineSignature(rawBody, channelSecret, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid x-line-signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    const events = payload.events || [];

    for (const event of events) {
      // Handle message events
      if (event.type === 'message' && event.message?.type === 'text') {
        const userId = event.source?.userId;
        const messageText = event.message.text;

        if (userId) {
          // Fetch or update user profile
          const profile = await getLineUserProfile(userId, channelAccessToken);
          await db.saveUser({
            userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            lastMessage: messageText,
            lastMessageTimestamp: event.timestamp || Date.now(),
          });

          // Save incoming message
          await db.addMessage({
            id: event.message.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId,
            sender: 'user',
            text: messageText,
            timestamp: event.timestamp || Date.now(),
            status: 'sent',
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('LINE Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
