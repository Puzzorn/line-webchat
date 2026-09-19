import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/store';
import { MessageType } from '@/lib/types';

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
      // Handle incoming LINE messages
      if (event.type === 'message') {
        const userId = event.source?.userId;
        const msg = event.message;

        if (userId && msg) {
          let messageType: MessageType = 'text';
          let text = '';
          let mediaUrl: string | undefined = undefined;
          let packageId: string | undefined = undefined;
          let stickerId: string | undefined = undefined;

          if (msg.type === 'text') {
            messageType = 'text';
            text = msg.text || '';
          } else if (msg.type === 'sticker') {
            messageType = 'sticker';
            packageId = msg.packageId;
            stickerId = msg.stickerId;
            text = '[สติกเกอร์]';
            if (stickerId) {
              mediaUrl = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/android/sticker.png`;
            }
          } else if (msg.type === 'image') {
            messageType = 'image';
            text = '[รูปภาพ]';
            mediaUrl = `/api/line/image/${msg.id}`;
          } else if (msg.type === 'location') {
            messageType = 'location';
            text = `📍 ${msg.title || msg.address || 'ตำแหน่งที่ตั้ง'}`;
          } else {
            messageType = 'file';
            text = `📎 ${msg.fileName || 'ไฟล์แนบ'}`;
          }

          // Fetch or update user profile
          const profile = await getLineUserProfile(userId, channelAccessToken);
          await db.saveUser({
            userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            lastMessage: text,
            lastMessageTimestamp: event.timestamp || Date.now(),
          });

          // Save incoming message
          await db.addMessage({
            id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId,
            sender: 'user',
            text: text,
            type: messageType,
            mediaUrl: mediaUrl,
            packageId: packageId,
            stickerId: stickerId,
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
