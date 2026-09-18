import { NextResponse } from 'next/server';

export async function GET() {
  const secret = process.env.LINE_CHANNEL_SECRET || '';
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

  const hasSecret = Boolean(secret && secret !== 'your_line_channel_secret_here');
  const hasToken = Boolean(token && token !== 'your_line_channel_access_token_here');
  const isLiveMode = hasSecret && hasToken;

  return NextResponse.json({
    isLiveMode,
    hasSecret,
    hasToken,
    mode: isLiveMode ? 'LIVE' : 'DEMO',
  });
}
