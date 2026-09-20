import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const users = await db.getUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, action } = await req.json();
    if (action === 'clear-unread' && userId) {
      await db.clearUnreadCount(userId);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
