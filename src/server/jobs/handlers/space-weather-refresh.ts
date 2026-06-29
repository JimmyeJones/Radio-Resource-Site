import { rawDb } from '@/db/client';
import type { Job } from '@/db/schema';
import type { ProgressFn } from './index';

const UA = 'RadioResourceSite/1.0';

// NOAA SWPC public JSON endpoints.
const SFI_URL = 'https://services.swpc.noaa.gov/json/f107_cm_flux.json';
const KINDEX_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const SUNSPOT_URL = 'https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json';

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function runSpaceWeatherRefresh(_job: Job, onProgress: ProgressFn) {
  onProgress(10, 'fetching NOAA SWPC');

  let sfi: number | null = null;
  let kIndex: number | null = null;
  let aIndex: number | null = null;
  let sunspots: number | null = null;

  const sfiData = await getJson<{ flux: number | string }[]>(SFI_URL);
  if (sfiData?.length) sfi = Number(sfiData[sfiData.length - 1].flux) || null;

  // products endpoint returns a header row then [time_tag, kp, a_running, station]
  const kData = await getJson<string[][]>(KINDEX_URL);
  if (kData && kData.length > 1) {
    const last = kData[kData.length - 1];
    kIndex = Number(last[1]) || null;
    aIndex = Number(last[2]) || null;
  }

  const ssData = await getJson<{ ssn: number | string }[]>(SUNSPOT_URL);
  if (ssData?.length) sunspots = Math.round(Number(ssData[ssData.length - 1].ssn)) || null;

  if (sfi === null && kIndex === null && sunspots === null) {
    throw new Error('SWPC returned no usable data');
  }

  onProgress(85, 'saving');
  rawDb
    .prepare(
      `INSERT INTO space_weather (id, sfi, sunspots, k_index, a_index, source, fetched_at, raw)
       VALUES (1, ?, ?, ?, ?, 'NOAA SWPC', ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         sfi=excluded.sfi, sunspots=excluded.sunspots, k_index=excluded.k_index,
         a_index=excluded.a_index, source=excluded.source, fetched_at=excluded.fetched_at, raw=excluded.raw`,
    )
    .run(sfi, sunspots, kIndex, aIndex, Math.floor(Date.now() / 1000), JSON.stringify({ sfi, kIndex, aIndex, sunspots }));

  onProgress(100, `SFI ${sfi ?? '—'} · K ${kIndex ?? '—'}`);
}
