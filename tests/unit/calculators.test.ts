import { describe, it, expect } from 'vitest';
import { dipoleLengthM, dishGainDbi, circularWaveguideCutoffMHz, coaxLossDb, COAX_CABLES } from '@/lib/tools/antenna';
import { fsplDb, dbmToWatts, wattsToDbm, vswrToReturnLossDb, returnLossToVswr, linkBudget } from '@/lib/tools/rf';
import { ipcWidthMil, ipcCurrent } from '@/lib/tools/pcb';

describe('antenna formulas', () => {
  it('½λ dipole at 14.2 MHz ≈ 10.0 m', () => {
    expect(dipoleLengthM(14.2)).toBeCloseTo(10.05, 1);
  });

  it('a 1.2 m dish at 1296 MHz has ~21.6 dBi gain', () => {
    const g = dishGainDbi(1.2, 1296, 0.55);
    expect(g).toBeGreaterThan(20);
    expect(g).toBeLessThan(23);
  });

  it('circular waveguide TE11 cutoff for 40 mm ID ≈ 4.4 GHz', () => {
    expect(circularWaveguideCutoffMHz(40)).toBeCloseTo(4392, -2);
  });

  it('coax loss grows with length and frequency', () => {
    const lmr400 = COAX_CABLES.find((c) => c.name === 'LMR-400')!;
    const short = coaxLossDb(lmr400, 435, 10);
    const long = coaxLossDb(lmr400, 435, 30);
    expect(long).toBeGreaterThan(short);
    expect(coaxLossDb(lmr400, 1000, 10)).toBeGreaterThan(coaxLossDb(lmr400, 144, 10));
  });
});

describe('RF formulas', () => {
  it('FSPL at 435 MHz over 1000 km ≈ 145 dB', () => {
    expect(fsplDb(1000, 435)).toBeCloseTo(145.2, 0);
  });

  it('watt ↔ dBm round-trips (5 W ≈ 37 dBm)', () => {
    expect(wattsToDbm(5)).toBeCloseTo(36.99, 1);
    expect(dbmToWatts(37)).toBeCloseTo(5.01, 1);
  });

  it('VSWR ↔ return loss round-trips', () => {
    const rl = vswrToReturnLossDb(2);
    expect(rl).toBeCloseTo(9.54, 1);
    expect(returnLossToVswr(rl)).toBeCloseTo(2, 2);
  });

  it('link budget subtracts path loss from EIRP', () => {
    const r = linkBudget({
      txPowerDbm: 37, txAntennaGainDbi: 0, txLossDb: 0,
      rxAntennaGainDbi: 0, rxLossDb: 0, distanceKm: 1000, freqMHz: 435,
    });
    expect(r.eirpDbm).toBe(37);
    expect(r.receivedPowerDbm).toBeCloseTo(37 - r.fsplDb, 5);
  });
});

describe('PCB formulas', () => {
  it('IPC-2221: ~1 A external, 1 oz, 10 °C rise needs a fraction of a mm', () => {
    const w = ipcWidthMil(1, 1, 10, true);
    expect(w).toBeGreaterThan(5);
    expect(w).toBeLessThan(30);
  });

  it('width→current and current→width are consistent', () => {
    const w = ipcWidthMil(2, 1, 10, true);
    expect(ipcCurrent(w, 1, 10, true)).toBeCloseTo(2, 1);
  });
});
