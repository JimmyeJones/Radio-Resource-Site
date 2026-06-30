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

describe('azimuthCompass', () => {
  it('maps degrees to the nearest 8-point compass heading', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(270)).toBe('W');
  });

  it('wraps headings near 360° back to N', () => {
    expect(azimuthCompass(350)).toBe('N');
    expect(azimuthCompass(360)).toBe('N');
  });
});

describe('buildIcs', () => {
  const pass: SatPass = {
    satellite: 'ISS (ZARYA)',
    norad: 25544,
    aos: 1704931200, // 2024-01-11T00:00:00Z
    los: 1704931800, // 2024-01-11T00:10:00Z
    maxElevationDeg: 42.6,
    maxElevationAt: 1704931500,
    durationS: 600,
    startAzimuthDeg: 10,
    endAzimuthDeg: 200,
  };

  it('wraps events in a valid VCALENDAR envelope with CRLF line endings', () => {
    const ics = buildIcs([pass]);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('\r\n');
    expect(ics).not.toContain('\n\n');
  });

  it('emits one VEVENT per pass with UTC start/end times and a stable UID', () => {
    const ics = buildIcs([pass]);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:25544-1704931200@radio-resource');
    expect(ics).toContain('DTSTART:20240111T000000Z');
    expect(ics).toContain('DTEND:20240111T001000Z');
    expect(ics).toContain('SUMMARY:ISS (ZARYA) pass · max 43°');
  });

  it('produces a header-only calendar when there are no passes', () => {
    const ics = buildIcs([]);
    expect(ics).not.toContain('BEGIN:VEVENT');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
  });
});
