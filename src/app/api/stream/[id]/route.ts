import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createReadStream, statSync } from 'node:fs';
import type { ReadStream } from 'node:fs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v?.filePath) return new Response('not found', { status: 404 });

  let stat;
  try {
    stat = statSync(v.filePath);
  } catch {
    return new Response('file missing', { status: 410 });
  }

  const size = stat.size;
  const range = req.headers.get('range');
  const contentType = 'video/mp4';

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (!m) return new Response('bad range', { status: 416 });
    const start = m[1] ? Number(m[1]) : 0;
    const end = m[2] ? Number(m[2]) : size - 1;
    if (start >= size || end >= size) {
      return new Response('range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${size}` },
      });
    }
    const stream = createReadStream(v.filePath, { start, end });
    return new Response(toWebStream(stream), {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=60',
      },
    });
  }

  const stream = createReadStream(v.filePath);
  return new Response(toWebStream(stream), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=60',
    },
  });
}

function toWebStream(stream: ReadStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(chunk as Buffer));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });
}
