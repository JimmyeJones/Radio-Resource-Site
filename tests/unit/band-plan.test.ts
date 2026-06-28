import { describe, it, expect } from 'vitest';
import { BANDS, formatFreq } from '@/lib/tools/band-plan';

describe('band plan data', () => {
  it('contains the major HF bands', () => {
    const names = BANDS.map((b) => b.name);
    for (const required of ['160 m', '80 m', '40 m', '20 m', '15 m', '10 m', '2 m', '70 cm']) {
      expect(names).toContain(required);
    }
  });

  it('all band segments are within the band edges', () => {
    for (const band of BANDS) {
      for (const seg of band.segments) {
        expect(seg.startKHz).toBeGreaterThanOrEqual(band.startKHz);
        expect(seg.endKHz).toBeLessThanOrEqual(band.endKHz);
        expect(seg.endKHz).toBeGreaterThan(seg.startKHz);
        expect(seg.modes.length).toBeGreaterThan(0);
        expect(seg.classes.length).toBeGreaterThan(0);
      }
    }
  });

  it('formats kHz vs MHz sensibly', () => {
    expect(formatFreq(3500)).toBe('3.5 MHz');
    expect(formatFreq(14000)).toBe('14 MHz');
    expect(formatFreq(5330.5)).toBe('5.3305 MHz');
  });
});
