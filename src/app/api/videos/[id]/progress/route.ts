import { NextRequest } from 'next/server';
import { saveProgress } from '@/server/videos/progress';

export const dynamic = 'force-dynamic';

// Receives navigator.sendBeacon() payloads when the tab is hidden/closed, so
// the resume position survives even when a server action couldn't finish.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let seconds = 0;
  try {
    const body = (await req.json()) as { seconds?: number };
    seconds = Number(body.seconds) || 0;
  } catch {
    return new Response('bad request', { status: 400 });
  }
  saveProgress(params.id, seconds);
  return new Response(null, { status: 204 });
}
