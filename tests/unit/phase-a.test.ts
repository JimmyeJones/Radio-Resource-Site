import { describe, it, expect } from 'vitest';
import { dopplerShiftHz } from '@/server/satellites/passes';
import { toMorse } from '@/lib/tools/cw';
import { S_METER } from '@/lib/tools/references';

describe('Doppler', () => {
  it('approaching satellite (negative range rate) shifts frequency up', () => {
    expect(dopplerShiftHz(145.8e6, -5)).toBeGreaterThan(0);
  });
  it('receding satellite shifts frequency down', () => {
    expect(dopplerShiftHz(145.8e6, 5)).toBeLessThan(0);
  });
  it('magnitude is plausible (~2.4 kHz for 145.8 MHz at 5 km/s)', () => {
    expect(Math.abs(dopplerShiftHz(145.8e6, 5))).toBeCloseTo(2432, -2);
  });
});

describe('Morse', () => {
  it('encodes CQ', () => {
    expect(toMorse('CQ')).toBe('-.-. --.-');
  });
  it('uses / for spaces', () => {
    expect(toMorse('SOS SOS')).toBe('... --- ... / ... --- ...');
  });
});

describe('S-meter', () => {
  it('S9 is -73 dBm ≈ 50 µV', () => {
    const s9 = S_METER.find((r) => r.s === 'S9')!;
    expect(s9.dbm).toBe(-73);
    expect(s9.uv50).toBeCloseTo(50, 0);
  });
});
