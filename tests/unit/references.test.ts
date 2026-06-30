import { describe, it, expect } from 'vitest';
import { decodeEmission } from '@/lib/tools/emissions';
import { gridDistanceBearing } from '@/lib/tools/satellites';
import { dbiToDbd, dbdToDbi, erpWatts, eirpWatts } from '@/lib/tools/rf';

describe('emission decoder', () => {
  it('decodes F3E as FM voice', () => {
    const d = decodeEmission('F3E')!;
    expect(d.modulation).toMatch(/Frequency modulation/);
    expect(d.information).toMatch(/Telephony/);
  });
  it('decodes A1A as CW telegraphy', () => {
    const d = decodeEmission('A1A')!;
    expect(d.modulation).toMatch(/Amplitude/);
    expect(d.information).toMatch(/Telegraphy/);
  });
  it('handles a bandwidth-prefixed code', () => {
    expect(decodeEmission('16K0F3E')?.modulation).toMatch(/Frequency modulation/);
  });
  it('rejects nonsense', () => {
    expect(decodeEmission('ZZZ')).toBeNull();
  });
});

describe('grid distance/bearing', () => {
  it('computes a transatlantic path roughly right', () => {
    const r = gridDistanceBearing('FN31pr', 'IO91wm')!; // ~NYC to London
    expect(r.distanceKm).toBeGreaterThan(5000);
    expect(r.distanceKm).toBeLessThan(6000);
    expect(r.bearingDeg).toBeGreaterThan(30);
    expect(r.bearingDeg).toBeLessThan(70);
  });
  it('is ~0 km for the same grid', () => {
    expect(gridDistanceBearing('FN31', 'FN31')!.distanceKm).toBeLessThan(50);
  });
  it('rejects bad grids', () => {
    expect(gridDistanceBearing('zz', 'FN31')).toBeNull();
  });
});

describe('gain & ERP/EIRP', () => {
  it('dBi↔dBd round-trips with the 2.15 dB dipole offset', () => {
    expect(dbiToDbd(2.15)).toBeCloseTo(0, 5);
    expect(dbdToDbi(0)).toBeCloseTo(2.15, 5);
  });
  it('EIRP is ~2.15 dB (1.64x) higher than ERP for the same setup', () => {
    const erp = erpWatts(100, 6, 1);
    const eirp = eirpWatts(100, 6 + 2.15, 1);
    expect(eirp / erp).toBeCloseTo(1.64, 1);
  });
});
