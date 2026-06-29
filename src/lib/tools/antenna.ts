// Antenna & feed design formulas.

export const C = 299_792_458; // speed of light, m/s

/** Wavelength in metres for a frequency in MHz. */
export function wavelengthM(freqMHz: number): number {
  return C / (freqMHz * 1e6);
}

/**
 * Half-wave dipole length (metres). Uses the classic 468/f(MHz) ft formula
 * converted to metres (≈ 0.95 velocity factor for thin wire).
 */
export function dipoleLengthM(freqMHz: number): number {
  return (468 / freqMHz) * 0.3048;
}

/** Quarter-wave vertical/element length (metres) for a velocity factor. */
export function quarterWaveM(freqMHz: number, velocityFactor = 0.95): number {
  return (wavelengthM(freqMHz) / 4) * velocityFactor;
}

/**
 * Parabolic dish gain (dBi). diameterM in metres, freqMHz, efficiency 0–1.
 * G = 10·log10( eff · (π·D/λ)² )
 */
export function dishGainDbi(diameterM: number, freqMHz: number, efficiency = 0.55): number {
  const lambda = wavelengthM(freqMHz);
  const g = efficiency * Math.pow((Math.PI * diameterM) / lambda, 2);
  return 10 * Math.log10(g);
}

/** Parabolic dish -3 dB beamwidth (degrees). */
export function dishBeamwidthDeg(diameterM: number, freqMHz: number): number {
  const lambda = wavelengthM(freqMHz);
  return (70 * lambda) / diameterM;
}

/** Focal length from f/D ratio. */
export function dishFocalLengthM(diameterM: number, fOverD: number): number {
  return diameterM * fOverD;
}

/**
 * Circular waveguide TE11 cutoff frequency (MHz) for inner diameter (mm).
 * fc = 1.8412·c / (π·D)
 */
export function circularWaveguideCutoffMHz(diameterMm: number): number {
  const d = diameterMm / 1000;
  return (1.8412 * C) / (Math.PI * d) / 1e6;
}

/** Required circular-waveguide inner diameter (mm) for a TE11 cutoff (MHz). */
export function circularWaveguideDiameterMm(cutoffMHz: number): number {
  const d = (1.8412 * C) / (Math.PI * cutoffMHz * 1e6);
  return d * 1000;
}

export interface CoaxCable {
  name: string;
  // attenuation in dB/100ft at reference frequencies (MHz)
  atten: { mhz: number; db100ft: number }[];
  velocityFactor: number;
}

// Typical manufacturer figures; good enough for planning.
export const COAX_CABLES: CoaxCable[] = [
  { name: 'RG-58', velocityFactor: 0.66, atten: [{ mhz: 30, db100ft: 2.5 }, { mhz: 150, db100ft: 6.2 }, { mhz: 450, db100ft: 11.2 }, { mhz: 1000, db100ft: 17.5 }] },
  { name: 'RG-8X', velocityFactor: 0.82, atten: [{ mhz: 30, db100ft: 1.9 }, { mhz: 150, db100ft: 4.5 }, { mhz: 450, db100ft: 8.0 }, { mhz: 1000, db100ft: 12.6 }] },
  { name: 'RG-213', velocityFactor: 0.66, atten: [{ mhz: 30, db100ft: 1.2 }, { mhz: 150, db100ft: 2.8 }, { mhz: 450, db100ft: 5.2 }, { mhz: 1000, db100ft: 8.3 }] },
  { name: 'LMR-240', velocityFactor: 0.84, atten: [{ mhz: 30, db100ft: 1.3 }, { mhz: 150, db100ft: 3.0 }, { mhz: 450, db100ft: 5.3 }, { mhz: 1000, db100ft: 8.0 }] },
  { name: 'LMR-400', velocityFactor: 0.85, atten: [{ mhz: 30, db100ft: 0.7 }, { mhz: 150, db100ft: 1.5 }, { mhz: 450, db100ft: 2.7 }, { mhz: 1000, db100ft: 4.1 }] },
  { name: 'LMR-600', velocityFactor: 0.87, atten: [{ mhz: 30, db100ft: 0.4 }, { mhz: 150, db100ft: 1.0 }, { mhz: 450, db100ft: 1.7 }, { mhz: 1000, db100ft: 2.7 }] },
];

/** Interpolate cable attenuation (dB/100ft) at an arbitrary frequency. */
export function coaxAttenDb100ft(cable: CoaxCable, freqMHz: number): number {
  const pts = cable.atten;
  if (freqMHz <= pts[0].mhz) return pts[0].db100ft;
  if (freqMHz >= pts[pts.length - 1].mhz) return pts[pts.length - 1].db100ft;
  for (let i = 1; i < pts.length; i++) {
    if (freqMHz <= pts[i].mhz) {
      const a = pts[i - 1];
      const b = pts[i];
      // log-frequency linear interpolation tracks coax loss better
      const f = (Math.log(freqMHz) - Math.log(a.mhz)) / (Math.log(b.mhz) - Math.log(a.mhz));
      return a.db100ft + f * (b.db100ft - a.db100ft);
    }
  }
  return pts[pts.length - 1].db100ft;
}

/** Total coax loss (dB) for a run length in metres. */
export function coaxLossDb(cable: CoaxCable, freqMHz: number, lengthM: number): number {
  const per100ft = coaxAttenDb100ft(cable, freqMHz);
  const lengthFt = lengthM / 0.3048;
  return (per100ft * lengthFt) / 100;
}
