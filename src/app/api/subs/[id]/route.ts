import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v?.subsPath) return new Response('no subs', { status: 404 });
  try {
    const data = readFileSync(v.subsPath);
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new Response('missing', { status: 410 });
  }
}
