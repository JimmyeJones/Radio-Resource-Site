import { db, rawDb } from '@/db/client';
import { tleCache } from '@/db/schema';
import { CELESTRAK_GROUPS, DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { parseTleBlock, type RawTle } from './parse';
import { randomUUID } from 'node:crypto';

export type { RawTle };
export { parseTleBlock };

export async function refreshTleCache(): Promise<number> {
  const all: RawTle[] = [];
  for (const url of Object.values(CELESTRAK_GROUPS)) {
    const res = await fetch(url, { headers: { 'user-agent': 'RadioResourceSite/1.0' } });
    if (!res.ok) continue;
    const text = await res.text();
    all.push(...parseTleBlock(text));
  }
  if (all.length === 0) throw new Error('No TLEs fetched');

  const presetIds = new Set(DEFAULT_PRESETS.map((p) => p.norad));
  rawDb.exec('DELETE FROM tle_cache');
  const insert = rawDb.prepare(
    'INSERT INTO tle_cache (id, sat_id, name, line1, line2) VALUES (?,?,?,?,?)',
  );
  let n = 0;
  const seen = new Set<number>();
  for (const t of all) {
    if (seen.has(t.satId)) continue;
    seen.add(t.satId);
    if (!presetIds.has(t.satId) && all.length > 200) continue;
    insert.run(randomUUID(), t.satId, t.name, t.line1, t.line2);
    n++;
  }
  return n;
}

export function getCachedTles() {
  return db.select().from(tleCache).all();
}
