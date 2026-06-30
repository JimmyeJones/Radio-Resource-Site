import { describe, it, expect } from 'vitest';
import { subsolarPoint, solarElevation, isDaylight } from '@/lib/astro';
import { fuzzyScore, fuzzyRank } from '@/lib/fuzzy';

describe('solar geometry', () => {
  it('subsolar latitude stays within the tropics', () => {
    for (const iso of ['2024-01-15', '2024-03-20', '2024-06-21', '2024-09-22', '2024-12-21']) {
      const s = subsolarPoint(new Date(`${iso}T12:00:00Z`));
      expect(Math.abs(s.lat)).toBeLessThanOrEqual(23.5);
    }
  });

  it('is near 0° declination at an equinox', () => {
    const s = subsolarPoint(new Date('2024-03-20T03:06:00Z')); // ~March equinox
    expect(Math.abs(s.lat)).toBeLessThan(1.0);
  });

  it('subsolar longitude tracks UTC (noon UTC ≈ 0° lon)', () => {
    const s = subsolarPoint(new Date('2024-06-21T12:00:00Z'));
    expect(Math.abs(s.lon)).toBeLessThan(5); // within a few degrees (equation of time)
  });

  it('it is daylight at the subsolar point and night at its antipode', () => {
    const s = subsolarPoint(new Date('2024-06-21T12:00:00Z'));
    expect(isDaylight(s.lat, s.lon, s)).toBe(true);
    const antiLon = ((s.lon + 360) % 360) - 180;
    expect(isDaylight(-s.lat, antiLon, s)).toBe(false);
    expect(solarElevation(s.lat, s.lon, s)).toBeGreaterThan(80); // sun overhead
  });
});

describe('fuzzy matcher', () => {
  it('matches subsequences and ranks word-starts higher', () => {
    expect(fuzzyScore('bp', 'Band Plan')).not.toBeNull();
    expect(fuzzyScore('xyz', 'Band Plan')).toBeNull();
  });
  it('ranks the best candidate first', () => {
    const items = ['Satellite Passes', 'Band Plan', 'Battery Reference'];
    const ranked = fuzzyRank('band', items, (s) => s);
    expect(ranked[0].item).toBe('Band Plan');
  });
});
