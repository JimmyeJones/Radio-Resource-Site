import { describe, it, expect } from 'vitest';
import {
  decodeResistor,
  decodeCapCode,
  decodeSmdResistor,
  ohmsLaw,
  ledResistor,
  rcCutoffHz,
  lcResonanceHz,
  timer555Astable,
} from '@/lib/tools/electronics';

describe('resistor color code', () => {
  it('brown-black-red-gold = 1 kΩ ±5%', () => {
    const r = decodeResistor(['brown', 'black', 'red', 'gold'])!;
    expect(r.ohms).toBe(1000);
    expect(r.tolerance).toBe(5);
  });
  it('5-band yellow-violet-black-brown-brown = 4.7 kΩ ±1%', () => {
    const r = decodeResistor(['yellow', 'violet', 'black', 'brown', 'brown'])!;
    expect(r.ohms).toBe(4700);
    expect(r.tolerance).toBe(1);
  });
});

describe('capacitor code', () => {
  it('104 = 100 nF', () => {
    expect(decodeCapCode('104')).toBeCloseTo(100e-9, 12);
  });
  it('220 = 22 pF', () => {
    expect(decodeCapCode('220')).toBeCloseTo(22e-12, 14);
  });
});

describe('SMD resistor code', () => {
  it('472 = 4.7 kΩ', () => {
    expect(decodeSmdResistor('472')).toBe(4700);
  });
  it('4R7 = 4.7 Ω', () => {
    expect(decodeSmdResistor('4R7')).toBeCloseTo(4.7, 5);
  });
  it('1002 = 10 kΩ', () => {
    expect(decodeSmdResistor('1002')).toBe(10000);
  });
});

describe('Ohms law', () => {
  it('5V across 250Ω → 20 mA, 0.1 W', () => {
    const r = ohmsLaw({ v: 5, r: 250 })!;
    expect(r.i).toBeCloseTo(0.02, 5);
    expect(r.p).toBeCloseTo(0.1, 5);
  });
});

describe('misc', () => {
  it('LED resistor 5V, 2V Vf, 20 mA = 150 Ω', () => {
    expect(ledResistor(5, 2, 20)).toBeCloseTo(150, 5);
  });
  it('RC 10k + 100nF ≈ 159 Hz', () => {
    expect(rcCutoffHz(10000, 1e-7)).toBeCloseTo(159.15, 1);
  });
  it('LC 1µH + 100pF ≈ 15.9 MHz', () => {
    expect(lcResonanceHz(1e-6, 1e-10) / 1e6).toBeCloseTo(15.92, 1);
  });
  it('555 astable duty is always >50%', () => {
    const a = timer555Astable(10000, 47000, 1e-7);
    expect(a.dutyPct).toBeGreaterThan(50);
    expect(a.freqHz).toBeGreaterThan(0);
  });
});
