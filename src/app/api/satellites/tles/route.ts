import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { tleCache } from '@/db/schema';
import { inArray, sql } from 'drizzle-orm';
import { DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { resolveObserver } from '@/server/satellites/observer';
import { enqueueJob } from '@/server/jobs/queue';

export const dynamic = 'force-dynamic';

// Delivers raw TLE lines so the browser can propagate satellite positions
// client-side (smooth animation without server round-trips).
export async function GET(req: NextRequest) {
  const ids =
    new URL(req.url).searchParams.get('norad')?.split(',').map((s) => Number(s.trim())).filter(Boolean) ??
    DEFAULT_PRESETS.map((p) => p.norad);

  const rows = db.select().from(tleCache).where(inArray(tleCache.satId, ids)).all();
  if (rows.length === 0) {
    const cnt = db.select({ n: sql<number>`count(*)` }).from(tleCache).get()?.n ?? 0;
    if (cnt === 0) enqueueJob({ kind: 'tle_refresh', payload: {} });
  }

  const observer = resolveObserver();
  return NextResponse.json({
    observer,
    sats: rows.map((r) => ({ norad: r.satId, name: r.name, line1: r.line1, line2: r.line2 })),
  });
}
