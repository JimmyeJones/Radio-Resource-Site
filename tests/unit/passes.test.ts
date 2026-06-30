import { describe, it, expect } from 'vitest';
import { azimuthCompass, buildIcs, type SatPass } from '@/server/satellites/passes';

describe('azimuthCompass', () => {
  it('maps the four cardinal directions', () => {
    expect(azimuthCompass(0)).toBe('N');
    expect(azimuthCompass(90)).toBe('E');
    expect(azimuthCompass(180)).toBe('S');
    expect(azimuthCompass(270)).toBe('W');
  });

  it('maps the inter-cardinal directions', () => {
    expect(azimuthCompass(45)).toBe('NE');
    expect(azimuthCompass(135)).toBe('SE');
    expect(azimuthCompass(225)).toBe('SW');
    expect(azimuthCompass(315)).toBe('NW');
  });

  it('wraps values near 360 back to North', () => {
    expect(azimuthCompass(360)).toBe('N');
    expect(azimuthCompass(350)).toBe('N');
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
    startAzimuthDeg: 90,
    endAzimuthDeg: 270,
  };

  it('wraps events in a valid VCALENDAR envelope', () => {
    const ics = buildIcs([pass]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics.split('\r\n')).toContain('VERSION:2.0');
  });

  it('emits one VEVENT per pass with UTC timestamps', () => {
    const ics = buildIcs([pass]);
    const lines = ics.split('\r\n');
    expect(lines.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(1);
    expect(lines.filter((l) => l === 'END:VEVENT')).toHaveLength(1);
    expect(lines).toContain('DTSTART:20240110T000000Z');
    expect(lines).toContain('DTEND:20240110T001000Z');
    expect(lines).toContain('UID:25544-1704844800@radio-resource');
  });

  it('summarizes elevation and AOS/LOS compass headings', () => {
    const ics = buildIcs([pass]);
    expect(ics).toContain('SUMMARY:ISS (ZARYA) pass · max 43°');
    expect(ics).toContain('DESCRIPTION:AOS E · LOS W · 600s');
  });

  it('produces an envelope with no events for an empty list', () => {
    const ics = buildIcs([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
