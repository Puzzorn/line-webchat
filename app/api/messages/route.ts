import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const beforeTimestampParam = searchParams.get('beforeTimestamp');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let allMessages = await db.getMessages(userId);

    // Ensure chronological order
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    if (beforeTimestampParam) {
      const beforeTs = parseInt(beforeTimestampParam, 10);
      if (!isNaN(beforeTs)) {
        allMessages = allMessages.filter((m) => m.timestamp < beforeTs);
      }
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 25;
    const totalCount = allMessages.length;
    const hasMore = totalCount > limit;

    // Return the latest 'limit' messages within the range
    const messages = hasMore ? allMessages.slice(totalCount - limit) : allMessages;

    return NextResponse.json({
      messages,
      totalCount,
      hasMore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');

    if (!userId || !messageId) {
      return NextResponse.json({ error: 'userId and messageId are required' }, { status: 400 });
    }

    await db.deleteMessage(userId, messageId);
    return NextResponse.json({ success: true, deletedId: messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
