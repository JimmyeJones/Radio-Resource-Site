import { db } from '@/db/client';
import { settings as settingsTbl } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { gridToLatLon } from '@/lib/tools/satellites';
import type { Observer } from './passes';

/** Resolve the observer location from settings (lat/lon preferred, else grid). */
export function resolveObserver(): Observer | null {
  const s = db.select().from(settingsTbl).where(eq(settingsTbl.id, 1)).get();
  if (s?.qthLat != null && s.qthLon != null) {
    return { lat: s.qthLat, lon: s.qthLon, elevationM: s.qthElevationM ?? 0 };
  }
  if (s?.qthGrid) {
    const ll = gridToLatLon(s.qthGrid);
    if (ll) return { ...ll, elevationM: 0 };
  }
  return null;
}
