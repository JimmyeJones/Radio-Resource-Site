export interface SatPreset {
  name: string;
  norad: number;
  group: 'Amateur' | 'Weather' | 'Crewed' | 'Space Telescope';
  description?: string;
}

// CelesTrak group endpoints (TLE format).
export const CELESTRAK_GROUPS = {
  amateur: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle',
  weather: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle',
  iss: 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle',
};

export const DEFAULT_PRESETS: SatPreset[] = [
  { name: 'ISS (ZARYA)', norad: 25544, group: 'Crewed', description: 'International Space Station (voice/APRS repeater).' },
  { name: 'AO-91 (RadFxSat)', norad: 43017, group: 'Amateur', description: 'FM voice repeater.' },
  { name: 'SO-50', norad: 27607, group: 'Amateur', description: 'FM voice repeater.' },
  { name: 'RS-44', norad: 44909, group: 'Amateur', description: 'Linear transponder.' },
  { name: 'NOAA-15', norad: 25338, group: 'Weather', description: 'APT weather imagery on 137.620 MHz.' },
  { name: 'NOAA-18', norad: 28654, group: 'Weather', description: 'APT weather imagery on 137.9125 MHz.' },
  { name: 'NOAA-19', norad: 33591, group: 'Weather', description: 'APT weather imagery on 137.100 MHz.' },
  { name: 'METEOR-M 2', norad: 40069, group: 'Weather', description: 'LRPT digital weather imagery.' },
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
