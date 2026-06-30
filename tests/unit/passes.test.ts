import { describe, it, expect } from 'vitest';
import { azimuthCompass, buildIcs, type SatPass } from '@/server/satellites/passes';

describe('azimuthCompass', () => {
  it('maps cardinal and intercardinal bearings', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(135)).toBe('SE');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(225)).toBe('SW');
    expect(azimuthCompass(270)).toBe('W');
    expect(azimuthCompass(315)).toBe('NW');
  });

  it('rounds to the nearest point and wraps 360 back to N', () => {
    expect(azimuthCompass(44)).toBe('NE');
    expect(azimuthCompass(360)).toBe('N');
  });
});

describe('buildIcs', () => {
  const pass: SatPass = {
    satellite: 'ISS (ZARYA)',
    norad: 25544,
    aos: 1704844800, // 2024-01-10T00:00:00Z
    los: 1704845400, // 2024-01-10T00:10:00Z
    maxElevationDeg: 42.7,
    maxElevationAt: 1704845100,
    durationS: 600,
    startAzimuthDeg: 10,
    endAzimuthDeg: 200,
  };

  it('wraps events in a valid VCALENDAR envelope with CRLF lines', () => {
    const ics = buildIcs([pass]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics.includes('\r\n')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('emits UTC timestamps and a derived summary/description', () => {
    const ics = buildIcs([pass]);
    expect(ics).toContain('DTSTART:20240110T000000Z');
    expect(ics).toContain('DTEND:20240110T001000Z');
    expect(ics).toContain('UID:25544-1704844800@radio-resource');
    expect(ics).toContain('SUMMARY:ISS (ZARYA) pass · max 43°');
    expect(ics).toContain('DESCRIPTION:AOS N · LOS S · 600s');
  });

  it('produces one VEVENT block per pass', () => {
    const ics = buildIcs([pass, { ...pass, aos: pass.aos + 5400 }]);
    const count = ics.split('BEGIN:VEVENT').length - 1;
    expect(count).toBe(2);
  });

  it('handles an empty pass list', () => {
    const ics = buildIcs([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
