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

  it('round-trips a 4-char grid back to the same square', () => {
    const ll = gridToLatLon('IO91')!;
    expect(latLonToGrid(ll.lat, ll.lon).slice(0, 4).toUpperCase()).toBe('IO91');
  });
});

describe('azimuthCompass', () => {
  it('maps cardinal and intercardinal bearings', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(270)).toBe('W');
  });

  it('wraps bearings near 360 back to North', () => {
    expect(azimuthCompass(350)).toBe('N');
    expect(azimuthCompass(360)).toBe('N');
  });
});

describe('buildIcs', () => {
  const pass: SatPass = {
    satellite: 'ISS (ZARYA)',
    norad: 25544,
    aos: 1704067200, // 2024-01-01T00:00:00Z
    los: 1704067800, // +10 min
    maxElevationDeg: 42.5,
    maxElevationAt: 1704067500,
    durationS: 600,
    startAzimuthDeg: 270,
    endAzimuthDeg: 90,
  };

  it('emits a single well-formed VEVENT wrapped in a VCALENDAR', () => {
    const ics = buildIcs([pass]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('UID:25544-1704067200@radio-resource');
    expect(ics).toContain('DTSTART:20240101T000000Z');
    expect(ics).toContain('DTEND:20240101T001000Z');
    // CRLF line endings per RFC 5545.
    expect(ics).toContain('\r\n');
  });

  it('emits one VEVENT per pass', () => {
    const ics = buildIcs([pass, { ...pass, aos: pass.aos + 3600 }]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
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
