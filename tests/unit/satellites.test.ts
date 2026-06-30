import { describe, it, expect } from 'vitest';
import { gridToLatLon, latLonToGrid } from '@/lib/tools/satellites';
import { predictPasses, azimuthCompass } from '@/server/satellites/passes';
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

  it('parses every satellite in a multi-record block', () => {
    const text = `ISS (ZARYA)
1 25544U 98067A   24010.50000000  .00012345  00000-0  22456-3 0  9991
2 25544  51.6400 100.0000 0001234  90.0000 270.0000 15.50000000123456
NOAA 19
1 33591U 09005A   24010.50000000  .00000100  00000-0  80000-4 0  9990
2 33591  99.1000 100.0000 0012000  90.0000 270.0000 14.13000000123450`;
    const parsed = parseTleBlock(text);
    expect(parsed).toHaveLength(2);
    expect(parsed.map((s) => s.satId)).toEqual([25544, 33591]);
    expect(parsed[1].name).toBe('NOAA 19');
  });

  it('ignores stray lines that are not a name/line1/line2 triple', () => {
    expect(parseTleBlock('just some text\nwith no elements')).toHaveLength(0);
  });
});

describe('azimuthCompass', () => {
  it('maps degrees to the nearest 8-point compass direction', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(270)).toBe('W');
  });
  it('wraps around 360 degrees back to N', () => {
    expect(azimuthCompass(360)).toBe('N');
    expect(azimuthCompass(350)).toBe('N');
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
