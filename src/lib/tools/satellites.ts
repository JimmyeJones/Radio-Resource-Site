export interface SatFreq {
  label: string;
  downlinkMHz?: number;
  uplinkMHz?: number;
  mode: string;
}

export interface SatPreset {
  name: string;
  norad: number;
  group: 'Amateur' | 'Weather' | 'Crewed' | 'Space Telescope';
  description?: string;
  frequencies?: SatFreq[];
}

// CelesTrak group endpoints (TLE format).
export const CELESTRAK_GROUPS = {
  amateur: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle',
  weather: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle',
  iss: 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle',
};

export const DEFAULT_PRESETS: SatPreset[] = [
  {
    name: 'ISS (ZARYA)',
    norad: 25544,
    group: 'Crewed',
    description: 'International Space Station (voice/APRS/SSTV).',
    frequencies: [
      { label: 'Voice downlink', downlinkMHz: 145.8, uplinkMHz: 144.49, mode: 'FM' },
      { label: 'APRS / packet', downlinkMHz: 145.825, uplinkMHz: 145.825, mode: 'AFSK 1k2' },
    ],
  },
  {
    name: 'AO-91 (RadFxSat)',
    norad: 43017,
    group: 'Amateur',
    description: 'FM voice repeater.',
    frequencies: [{ label: 'FM repeater', downlinkMHz: 145.96, uplinkMHz: 435.25, mode: 'FM (67 Hz CTCSS)' }],
  },
  {
    name: 'SO-50',
    norad: 27607,
    group: 'Amateur',
    description: 'FM voice repeater.',
    frequencies: [{ label: 'FM repeater', downlinkMHz: 436.795, uplinkMHz: 145.85, mode: 'FM (67 Hz CTCSS)' }],
  },
  {
    name: 'RS-44',
    norad: 44909,
    group: 'Amateur',
    description: 'Linear (inverting) transponder.',
    frequencies: [{ label: 'SSB/CW transponder', downlinkMHz: 435.67, uplinkMHz: 145.96, mode: 'Linear inverting' }],
  },
  {
    name: 'NOAA-15',
    norad: 25338,
    group: 'Weather',
    description: 'APT weather imagery.',
    frequencies: [{ label: 'APT', downlinkMHz: 137.62, mode: 'APT' }],
  },
  {
    name: 'NOAA-18',
    norad: 28654,
    group: 'Weather',
    description: 'APT weather imagery.',
    frequencies: [{ label: 'APT', downlinkMHz: 137.9125, mode: 'APT' }],
  },
  {
    name: 'NOAA-19',
    norad: 33591,
    group: 'Weather',
    description: 'APT weather imagery.',
    frequencies: [{ label: 'APT', downlinkMHz: 137.1, mode: 'APT' }],
  },
  {
    name: 'METEOR-M 2',
    norad: 40069,
    group: 'Weather',
    description: 'LRPT digital weather imagery.',
    frequencies: [{ label: 'LRPT', downlinkMHz: 137.1, mode: 'LRPT QPSK' }],
  },
];

// Maidenhead grid <-> lat/lon helpers
export function gridToLatLon(grid: string): { lat: number; lon: number } | null {
  const g = grid.trim().toUpperCase();
  if (!/^[A-R]{2}\d{2}([A-X]{2})?$/.test(g)) return null;
  const A = 'A'.charCodeAt(0);
  let lon = (g.charCodeAt(0) - A) * 20 - 180;
  let lat = (g.charCodeAt(1) - A) * 10 - 90;
  lon += parseInt(g[2], 10) * 2;
  lat += parseInt(g[3], 10);
  if (g.length === 6) {
    lon += (g.charCodeAt(4) - A) * (2 / 24) + 1 / 24;
    lat += (g.charCodeAt(5) - A) * (1 / 24) + 1 / 48;
  } else {
    lon += 1;
    lat += 0.5;
  }
  return { lat, lon };
}

export function latLonToGrid(lat: number, lon: number): string {
  const A = 'A'.charCodeAt(0);
  const lonAdj = lon + 180;
  const latAdj = lat + 90;
  const F1 = Math.floor(lonAdj / 20);
  const F2 = Math.floor(latAdj / 10);
  const F3 = Math.floor((lonAdj % 20) / 2);
  const F4 = Math.floor(latAdj % 10);
  const F5 = Math.floor(((lonAdj - F1 * 20 - F3 * 2) * 60) / 5);
  const F6 = Math.floor(((latAdj - F2 * 10 - F4) * 60) / 2.5);
  return (
    String.fromCharCode(A + F1) +
    String.fromCharCode(A + F2) +
    F3.toString() +
    F4.toString() +
    String.fromCharCode(A + F5).toLowerCase() +
    String.fromCharCode(A + F6).toLowerCase()
  );
}

/** Great-circle distance (km) and initial bearing (°) between two grid squares. */
export function gridDistanceBearing(
  fromGrid: string,
  toGrid: string,
): { distanceKm: number; bearingDeg: number } | null {
  const a = gridToLatLon(fromGrid);
  const b = gridToLatLon(toGrid);
  if (!a || !b) return null;
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lon - a.lon);
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const distanceKm = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearingDeg = (Math.atan2(y, x) * 180) / Math.PI;
  return { distanceKm, bearingDeg: (bearingDeg + 360) % 360 };
}
