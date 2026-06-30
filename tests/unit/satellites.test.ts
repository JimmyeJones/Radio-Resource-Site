import { describe, it, expect } from 'vitest';
import { gridToLatLon, latLonToGrid } from '@/lib/tools/satellites';
import { predictPasses, azimuthCompass, buildIcs, type SatPass } from '@/server/satellites/passes';
import { parseTleBlock } from '@/server/satellites/parse';

describe('Maidenhead grid conversion', () => {
  it('round-trips a 6-char grid', () => {
    const grid = 'FN31pr';
    const ll = gridToLatLon(grid)!;
    expect(ll.lat).toBeGreaterThan(40);
    expect(ll.lat).toBeLessThan(42);
    expect(ll.lon).toBeGreaterThan(-75);
    expect(ll.lon).toBeLessThan(-72);
    const back = latLonToGrid(ll.lat, ll.lon);
    expect(back.slice(0, 4).toUpperCase()).toBe('FN31');
  });

  it('rejects bogus grids', () => {
    expect(gridToLatLon('zz99zz')).toBeNull();
    expect(gridToLatLon('ABC')).toBeNull();
  });
});

describe('TLE parsing', () => {
  it('extracts ISS from a 3-line block', () => {
    const text = `ISS (ZARYA)
1 25544U 98067A   24010.50000000  .00012345  00000-0  22456-3 0  9991
2 25544  51.6400 100.0000 0001234  90.0000 270.0000 15.50000000123456`;
    const parsed = parseTleBlock(text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].satId).toBe(25544);
    expect(parsed[0].name).toBe('ISS (ZARYA)');
  });

  it('extracts every satellite from a multi-entry block', () => {
    const text = `ISS (ZARYA)
1 25544U 98067A   24010.50000000  .00012345  00000-0  22456-3 0  9991
2 25544  51.6400 100.0000 0001234  90.0000 270.0000 15.50000000123456
NOAA 18
1 28654U 05018A   24010.40000000  .00000100  00000-0  80000-4 0  9990
2 28654  98.9000 100.0000 0013000 200.0000 160.0000 14.13000000900000`;
    const parsed = parseTleBlock(text);
    expect(parsed).toHaveLength(2);
    expect(parsed.map((p) => p.satId)).toEqual([25544, 28654]);
    expect(parsed[1].name).toBe('NOAA 18');
  });

  it('ignores stray lines that are not a valid 3-line set', () => {
    const text = `# comment line
ISS (ZARYA)
1 25544U 98067A   24010.50000000  .00012345  00000-0  22456-3 0  9991
2 25544  51.6400 100.0000 0001234  90.0000 270.0000 15.50000000123456`;
    const parsed = parseTleBlock(text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].satId).toBe(25544);
  });
});

describe('azimuthCompass', () => {
  it('maps degrees to the nearest 8-point compass direction', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(135)).toBe('SE');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(225)).toBe('SW');
    expect(azimuthCompass(270)).toBe('W');
    expect(azimuthCompass(315)).toBe('NW');
  });

  it('wraps angles near 360 back to N', () => {
    expect(azimuthCompass(350)).toBe('N');
    expect(azimuthCompass(360)).toBe('N');
  });
});

describe('buildIcs', () => {
  const pass: SatPass = {
    satellite: 'ISS (ZARYA)',
    norad: 25544,
    aos: 1704844800,
    los: 1704845400,
    maxElevationDeg: 42,
    maxElevationAt: 1704845100,
    durationS: 600,
    startAzimuthDeg: 10,
    endAzimuthDeg: 190,
  };

  it('wraps events in a single VCALENDAR', () => {
    const ics = buildIcs([pass]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
    expect(ics).toContain('UID:25544-1704844800@radio-resource');
    // AOS azimuth 10° -> N, LOS azimuth 190° -> S
    expect(ics).toContain('DESCRIPTION:AOS N · LOS S · 600s');
  });

  it('emits one VEVENT per pass', () => {
    const ics = buildIcs([pass, { ...pass, aos: pass.aos + 7200, norad: 28654 }]);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
  });

  it('produces an empty but valid calendar for no passes', () => {
    const ics = buildIcs([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(0);
  });
});

describe('pass prediction', () => {
  it('returns an array (empty for unrealistic observer is fine)', () => {
    const tle = {
      name: 'ISS',
      norad: 25544,
      line1: '1 25544U 98067A   24010.50000000  .00012345  00000-0  22456-3 0  9991',
      line2: '2 25544  51.6400 100.0000 0001234  90.0000 270.0000 15.50000000123456',
    };
    const result = predictPasses(tle, { lat: 40, lon: -74 }, 24, new Date('2024-01-10T00:00:00Z'));
    expect(Array.isArray(result)).toBe(true);
  });
});
