// PCB design formulas. Sources: IPC-2221 trace current/width, standard
// microstrip/stripline impedance approximations (Wheeler / IPC-2141).

const OZ_TO_MM = 0.0347; // 1 oz/ft² copper ≈ 34.8 µm = 0.0348 mm thickness

/**
 * IPC-2221 max current for a trace.
 * width_mil and thickness in oz; returns amps for a given temp rise (°C).
 */
export function ipcCurrent(widthMil: number, thicknessOz: number, tempRiseC: number, external = true): number {
  const k = external ? 0.048 : 0.024;
  const areaMil2 = widthMil * (thicknessOz * 1.378); // 1 oz ≈ 1.378 mil thick
  // I = k * dT^0.44 * A^0.725
  return k * Math.pow(tempRiseC, 0.44) * Math.pow(areaMil2, 0.725);
}

/** Inverse: required trace width (mil) to carry a current at a temp rise. */
export function ipcWidthMil(
  currentA: number,
  thicknessOz: number,
  tempRiseC: number,
  external = true,
): number {
  const k = external ? 0.048 : 0.024;
  const area = Math.pow(currentA / (k * Math.pow(tempRiseC, 0.44)), 1 / 0.725);
  return area / (thicknessOz * 1.378);
}

export const milToMm = (mil: number) => mil * 0.0254;
export const mmToMil = (mm: number) => mm / 0.0254;

/**
 * Microstrip characteristic impedance (IPC-2141 approximation).
 * All distances same unit. h = dielectric height, w = trace width,
 * t = copper thickness, er = relative permittivity.
 */
export function microstripImpedance(w: number, h: number, t: number, er: number): number {
  if (w <= 0 || h <= 0) return NaN;
  const z = (87 / Math.sqrt(er + 1.41)) * Math.log((5.98 * h) / (0.8 * w + t));
  return z;
}

/**
 * Symmetric stripline characteristic impedance (IPC-2141 approximation).
 * b = total dielectric between planes, w = trace width, t = copper thickness.
 */
export function striplineImpedance(w: number, b: number, t: number, er: number): number {
  if (w <= 0 || b <= 0) return NaN;
  const z = (60 / Math.sqrt(er)) * Math.log((1.9 * b) / (0.8 * w + t));
  return z;
}

/** Plated via current capacity (IPC-2221) for a given temp rise. */
export function viaCurrent(diameterMm: number, platingUm: number, tempRiseC: number): number {
  // Cross-sectional area of the copper annulus, approximated as circumference × plating.
  const circ = Math.PI * diameterMm; // mm
  const areaMm2 = circ * (platingUm / 1000);
  const areaMil2 = areaMm2 / (0.0254 * 0.0254);
  // Treat via like an internal trace.
  return 0.024 * Math.pow(tempRiseC, 0.44) * Math.pow(areaMil2, 0.725);
}

export const COPPER_WEIGHTS = [0.5, 1, 2, 3] as const;
export { OZ_TO_MM };
