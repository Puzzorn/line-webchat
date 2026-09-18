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
