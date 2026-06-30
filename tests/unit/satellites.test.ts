import { describe, it, expect } from 'vitest';
import { gridToLatLon, latLonToGrid } from '@/lib/tools/satellites';
import { predictPasses, buildIcs, type SatPass } from '@/server/satellites/passes';
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

describe('ICS export', () => {
  const basePass: SatPass = {
    satellite: 'ISS (ZARYA)',
    norad: 25544,
    aos: 1704844800, // 2024-01-10T00:00:00Z
    los: 1704845400,
    maxElevationDeg: 42.4,
    maxElevationAt: 1704845100,
    durationS: 600,
    startAzimuthDeg: 10,
    endAzimuthDeg: 200,
  };

  it('produces a well-formed VCALENDAR with CRLF line endings', () => {
    const ics = buildIcs([basePass]);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.includes('\r\nEND:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:25544-1704844800@radio-resource');
    expect(ics).toContain('DTSTART:20240110T000000Z');
  });

  it('escapes commas, semicolons and backslashes in TEXT values (RFC 5545)', () => {
    const ics = buildIcs([{ ...basePass, satellite: 'FOO-1, BAR; v\\2' }]);
    expect(ics).toContain('SUMMARY:FOO-1\\, BAR\\; v\\\\2 pass');
    // The raw, unescaped form must not leak into the output.
    expect(ics).not.toContain('SUMMARY:FOO-1, BAR; v\\2');
  });
});
