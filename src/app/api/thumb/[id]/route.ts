import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v?.thumbnailPath) return new Response('no thumb', { status: 404 });
  try {
    const buf = readFileSync(v.thumbnailPath);
    const ext = extname(v.thumbnailPath).toLowerCase();
    const ct = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return new Response(buf, {
      status: 200,
      headers: { 'Content-Type': ct, 'Cache-Control': 'private, max-age=3600' },
    });
  } catch {
    return new Response('missing', { status: 410 });
  }
}
