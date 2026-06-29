// Quick electronics calculators — pure functions.

export const RESISTOR_COLORS = [
  'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white',
] as const;
export type ResistorColor = (typeof RESISTOR_COLORS)[number];

const MULTIPLIER_COLORS: Record<string, number> = {
  black: 1, brown: 10, red: 100, orange: 1e3, yellow: 1e4, green: 1e5,
  blue: 1e6, violet: 1e7, grey: 1e8, white: 1e9, gold: 0.1, silver: 0.01,
};

const TOLERANCE_COLORS: Record<string, number> = {
  brown: 1, red: 2, green: 0.5, blue: 0.25, violet: 0.1, grey: 0.05, gold: 5, silver: 10,
};

/** Decode a 4- or 5-band resistor to ohms + tolerance %. bands = digit colors then multiplier then tolerance. */
export function decodeResistor(bands: string[]): { ohms: number; tolerance: number } | null {
  if (bands.length !== 4 && bands.length !== 5) return null;
  const digitCount = bands.length === 4 ? 2 : 3;
  let digits = 0;
  for (let i = 0; i < digitCount; i++) {
    const d = RESISTOR_COLORS.indexOf(bands[i] as ResistorColor);
    if (d < 0) return null;
    digits = digits * 10 + d;
  }
  const mult = MULTIPLIER_COLORS[bands[digitCount]];
  if (mult === undefined) return null;
  const tol = TOLERANCE_COLORS[bands[digitCount + 1]] ?? 20;
  return { ohms: digits * mult, tolerance: tol };
}

/** Decode a ceramic capacitor 3-digit code (e.g. "104") to farads. */
export function decodeCapCode(code: string): number | null {
  const m = code.trim().match(/^(\d)(\d)(\d)$/);
  if (!m) {
    const two = code.trim().match(/^(\d)(\d)$/);
    if (two) return Number(code) * 1e-12;
    return null;
  }
  const significant = Number(m[1] + m[2]);
  const mult = Math.pow(10, Number(m[3]));
  return significant * mult * 1e-12; // result in farads (code is in pF)
}

/** Decode an SMD resistor code: 3-digit, 4-digit, or EIA-96 (e.g. "01C"). */
export function decodeSmdResistor(code: string): number | null {
  const c = code.trim().toUpperCase();
  if (/^\d{3}$/.test(c)) {
    return Number(c.slice(0, 2)) * Math.pow(10, Number(c[2]));
  }
  if (/^\d{4}$/.test(c)) {
    return Number(c.slice(0, 3)) * Math.pow(10, Number(c[3]));
  }
  // "R" notation, e.g. 4R7 = 4.7
  if (/^\d*R\d*$/.test(c)) return Number(c.replace('R', '.'));
  // EIA-96: two digits (value code) + letter (multiplier)
  const m = c.match(/^(\d{2})([A-Z])$/);
  if (m) {
    const value = EIA96[Number(m[1])];
    const mult = EIA96_MULT[m[2]];
    if (value && mult !== undefined) return value * mult;
  }
  return null;
}

const EIA96: Record<number, number> = (() => {
  const seq = [
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158,
    162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255,
    261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
    422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665,
    681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976,
  ];
  const out: Record<number, number> = {};
  seq.forEach((v, i) => (out[i + 1] = v / 100));
  return out;
})();

const EIA96_MULT: Record<string, number> = {
  Z: 0.001, Y: 0.01, R: 0.01, X: 0.1, S: 0.1, A: 1, B: 10, H: 10, C: 100, D: 1e3, E: 1e4, F: 1e5,
};

/** Ohm's law — provide any two of V/I/R; returns all four (incl. power). */
export function ohmsLaw(input: { v?: number; i?: number; r?: number; p?: number }): {
  v: number; i: number; r: number; p: number;
} | null {
  let { v, i, r, p } = input;
  const has = (x: number | undefined): x is number => typeof x === 'number' && !Number.isNaN(x);
  if (has(v) && has(i)) { r = v / i; p = v * i; }
  else if (has(v) && has(r)) { i = v / r; p = (v * v) / r; }
  else if (has(i) && has(r)) { v = i * r; p = i * i * r; }
  else if (has(p) && has(v)) { i = p / v; r = (v * v) / p; }
  else if (has(p) && has(i)) { v = p / i; r = p / (i * i); }
  else if (has(p) && has(r)) { i = Math.sqrt(p / r); v = Math.sqrt(p * r); }
  else return null;
  return { v: v!, i: i!, r: r!, p: p! };
}

/** LED series resistor: (supply − Vf) / I. */
export function ledResistor(supplyV: number, ledVf: number, ledMa: number): number {
  return (supplyV - ledVf) / (ledMa / 1000);
}

/** RC low-pass cutoff frequency (Hz). R in ohms, C in farads. */
export function rcCutoffHz(r: number, c: number): number {
  return 1 / (2 * Math.PI * r * c);
}

/** LC resonant frequency (Hz). L in henries, C in farads. */
export function lcResonanceHz(l: number, c: number): number {
  return 1 / (2 * Math.PI * Math.sqrt(l * c));
}

/** Voltage divider output. */
export function voltageDivider(vin: number, r1: number, r2: number): number {
  return (vin * r2) / (r1 + r2);
}

/** 555 astable frequency & duty (R1, R2 in ohms, C in farads). */
export function timer555Astable(r1: number, r2: number, c: number): { freqHz: number; dutyPct: number } {
  const freqHz = 1.44 / ((r1 + 2 * r2) * c);
  const dutyPct = ((r1 + r2) / (r1 + 2 * r2)) * 100;
  return { freqHz, dutyPct };
}

/** 555 monostable pulse width (seconds). */
export function timer555Monostable(r: number, c: number): number {
  return 1.1 * r * c;
}

export function formatOhms(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2).replace(/\.?0+$/, '')} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(2).replace(/\.?0+$/, '')} kΩ`;
  return `${ohms.toFixed(2).replace(/\.?0+$/, '')} Ω`;
}

export function formatFarads(f: number): string {
  if (f >= 1e-6) return `${(f * 1e6).toFixed(3).replace(/\.?0+$/, '')} µF`;
  if (f >= 1e-9) return `${(f * 1e9).toFixed(3).replace(/\.?0+$/, '')} nF`;
  return `${(f * 1e12).toFixed(1).replace(/\.?0+$/, '')} pF`;
}

export function formatHz(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(3).replace(/\.?0+$/, '')} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(3).replace(/\.?0+$/, '')} kHz`;
  return `${hz.toFixed(2).replace(/\.?0+$/, '')} Hz`;
}
