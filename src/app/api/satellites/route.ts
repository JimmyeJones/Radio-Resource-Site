import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { settings as settingsTbl, tleCache } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { predictPasses, buildIcs, type Observer, type SatPass } from '@/server/satellites/passes';
import { DEFAULT_PRESETS, gridToLatLon } from '@/lib/tools/satellites';
import { enqueueJob } from '@/server/jobs/queue';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wantIcs = url.searchParams.get('format') === 'ics';
  const hours = Math.min(168, Math.max(6, Number(url.searchParams.get('hours') ?? 48)));
  const ids = url.searchParams.get('norad')?.split(',').map((s) => Number(s.trim())).filter(Boolean) ??
    DEFAULT_PRESETS.map((p) => p.norad);

  const s = db.select().from(settingsTbl).where(eq(settingsTbl.id, 1)).get();
  let observer: Observer | null = null;
  if (s?.qthLat != null && s.qthLon != null) {
    observer = { lat: s.qthLat, lon: s.qthLon, elevationM: s.qthElevationM ?? 0 };
  } else if (s?.qthGrid) {
    const ll = gridToLatLon(s.qthGrid);
    if (ll) observer = { ...ll, elevationM: 0 };
  }
  if (!observer) {
    return NextResponse.json({ error: 'Set your QTH in Settings first.', passes: [] }, { status: 400 });
  }

  const tleRows = db.select().from(tleCache).where(inArray(tleCache.satId, ids)).all();
  if (tleRows.length === 0) {
    const cnt = db.select({ n: sql<number>`count(*)` }).from(tleCache).get()?.n ?? 0;
    if (cnt === 0) enqueueJob({ kind: 'tle_refresh', payload: {} });
    return NextResponse.json({
      error: 'No TLE data cached yet. A refresh has been queued — try again in a minute.',
      passes: [],
    });
  }

  const passes: SatPass[] = [];
  for (const row of tleRows) {
    passes.push(
      ...predictPasses(
        { name: row.name, norad: row.satId, line1: row.line1, line2: row.line2 },
        observer,
        hours,
      ),
    );
  }
  passes.sort((a, b) => a.aos - b.aos);

  if (wantIcs) {
    return new Response(buildIcs(passes), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename=satellite-passes.ics',
      },
    });
  }
  return NextResponse.json({ passes, observer });
}
