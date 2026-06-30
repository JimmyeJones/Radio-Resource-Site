import { describe, it, expect } from 'vitest';
import { gridToLatLon, latLonToGrid } from '@/lib/tools/satellites';
import { predictPasses, buildIcs, azimuthCompass, type SatPass } from '@/server/satellites/passes';
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
  const pass: SatPass = {
    satellite: 'OBJECT A, B; test',
    norad: 99999,
    aos: 1704844800,
    los: 1704845400,
    maxElevationDeg: 42,
    maxElevationAt: 1704845100,
    durationS: 600,
    startAzimuthDeg: 90,
    endAzimuthDeg: 270,
  };

  it('produces a well-formed VCALENDAR', () => {
    const ics = buildIcs([pass]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:99999-1704844800@radio-resource');
    // CRLF line endings per RFC 5545.
    expect(ics).toContain('\r\n');
  });

  it('escapes TEXT special characters in the summary', () => {
    const ics = buildIcs([pass]);
    // Commas and semicolons in the satellite name must be backslash-escaped
    // so they are not parsed as ICS value/parameter separators.
    expect(ics).toContain('SUMMARY:OBJECT A\\, B\\; test pass');
    expect(ics).not.toContain('SUMMARY:OBJECT A, B; test');
  });
});

describe('azimuthCompass', () => {
  it('maps degrees to the nearest 8-point compass direction', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(270)).toBe('W');
    expect(azimuthCompass(360)).toBe('N');
  });
});
