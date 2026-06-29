import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { parseVttCues } from '@/server/search';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v?.subsPath) return NextResponse.json({ cues: [] });
  return NextResponse.json({ cues: parseVttCues(v.subsPath) });
}
