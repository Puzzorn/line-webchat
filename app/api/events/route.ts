import { NextRequest } from 'next/server';
import { chatEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      const onNewMessage = (data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'new-message', ...data })}\n\n`)
          );
        } catch (e) {
          console.error('Error enqueuing SSE message:', e);
        }
      };

      const onUserUpdated = (data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'user-updated', ...data })}\n\n`)
          );
        } catch (e) {
          console.error('Error enqueuing SSE user update:', e);
        }
      };

      chatEvents.on('new-message', onNewMessage);
      chatEvents.on('user-updated', onUserUpdated);

      // Keep connection alive with periodic heartbeats (ping every 15 seconds)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Clean up when client closes connection
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        chatEvents.off('new-message', onNewMessage);
        chatEvents.off('user-updated', onUserUpdated);
        try {
          controller.close();
        } catch (e) {
          // Stream might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
