import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { tleCache } from '@/db/schema';
import { inArray, sql } from 'drizzle-orm';
import { predictPasses, passTrack, dopplerShiftHz } from '@/server/satellites/passes';
import { resolveObserver } from '@/server/satellites/observer';
import { DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { enqueueJob } from '@/server/jobs/queue';

export const dynamic = 'force-dynamic';

// Returns the single soonest upcoming pass across the selected satellites,
// with its az/el track and Doppler for the primary downlink frequency.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ids =
    url.searchParams.get('norad')?.split(',').map((s) => Number(s.trim())).filter(Boolean) ??
    DEFAULT_PRESETS.map((p) => p.norad);

  const observer = resolveObserver();
  if (!observer) return NextResponse.json({ error: 'Set your QTH in Settings first.' }, { status: 400 });

  const tleRows = db.select().from(tleCache).where(inArray(tleCache.satId, ids)).all();
  if (tleRows.length === 0) {
    const cnt = db.select({ n: sql<number>`count(*)` }).from(tleCache).get()?.n ?? 0;
    if (cnt === 0) enqueueJob({ kind: 'tle_refresh', payload: {} });
    return NextResponse.json({ error: 'No TLE data cached yet — a refresh was queued.' });
  }

  let best: { row: (typeof tleRows)[number]; pass: ReturnType<typeof predictPasses>[number] } | null = null;
  for (const row of tleRows) {
    const passes = predictPasses(
      { name: row.name, norad: row.satId, line1: row.line1, line2: row.line2 },
      observer,
      24,
    );
    for (const p of passes) {
      if (p.los < Date.now() / 1000) continue;
      if (!best || p.aos < best.pass.aos) best = { row, pass: p };
    }
  }

  if (!best) return NextResponse.json({ pass: null });

  const preset = DEFAULT_PRESETS.find((p) => p.norad === best!.row.satId);
  const downMHz = preset?.frequencies?.find((f) => f.downlinkMHz)?.downlinkMHz;
  const track = passTrack(
    { name: best.row.name, norad: best.row.satId, line1: best.row.line1, line2: best.row.line2 },
    observer,
    best.pass,
    Math.max(5, Math.round(best.pass.durationS / 60)),
  ).map((tp) => ({
    az: Math.round(tp.az),
    el: Math.round(tp.el),
    dopplerHz: downMHz ? Math.round(dopplerShiftHz(downMHz * 1e6, tp.rangeRateKmS)) : null,
  }));

  return NextResponse.json({
    pass: {
      satellite: best.pass.satellite,
      norad: best.row.satId,
      aos: best.pass.aos,
      los: best.pass.los,
      maxElevationDeg: Math.round(best.pass.maxElevationDeg),
      durationS: best.pass.durationS,
      startAz: Math.round(best.pass.startAzimuthDeg),
      endAz: Math.round(best.pass.endAzimuthDeg),
      downlinkMHz: downMHz ?? null,
      track,
    },
  });
}
