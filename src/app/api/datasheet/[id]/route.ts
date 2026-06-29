import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { datasheets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createReadStream, statSync } from 'node:fs';
import type { ReadStream } from 'node:fs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const d = db.select().from(datasheets).where(eq(datasheets.id, params.id)).get();
  if (!d?.filePath) return new Response('not ready', { status: 404 });

  let stat;
  try {
    stat = statSync(d.filePath);
  } catch {
    return new Response('file missing', { status: 410 });
  }

  const size = stat.size;
  const range = req.headers.get('range');
  const headersBase = {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${(d.title || 'datasheet').replace(/[^\w.-]+/g, '_')}.pdf"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=300',
  };

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
    return new Response(toWebStream(createReadStream(d.filePath, { start, end })), {
      status: 206,
      headers: {
        ...headersBase,
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${size}`,
      },
    });
  }

  return new Response(toWebStream(createReadStream(d.filePath)), {
    status: 200,
    headers: { ...headersBase, 'Content-Length': String(size) },
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
