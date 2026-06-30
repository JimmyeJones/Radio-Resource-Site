import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/server/search';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });
  // Reuse the FTS index; cap tightly for palette latency.
  return NextResponse.json({ results: search(q, 6) });
}
