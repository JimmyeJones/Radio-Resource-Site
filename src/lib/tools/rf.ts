// RF link-budget and conversion helpers.

/**
 * Free-space path loss (dB). FSPL = 20log10(d) + 20log10(f) + 32.44,
 * with d in km and f in MHz.
 */
export function fsplDb(distanceKm: number, freqMHz: number): number {
  if (distanceKm <= 0 || freqMHz <= 0) return NaN;
  return 20 * Math.log10(distanceKm) + 20 * Math.log10(freqMHz) + 32.44;
}

export function dbmToWatts(dbm: number): number {
  return Math.pow(10, (dbm - 30) / 10);
}

export function wattsToDbm(watts: number): number {
  if (watts <= 0) return -Infinity;
  return 10 * Math.log10(watts) + 30;
}

/** VSWR → reflection coefficient magnitude (Γ). */
export function vswrToGamma(vswr: number): number {
  if (vswr < 1) return NaN;
  return (vswr - 1) / (vswr + 1);
}

/** VSWR → return loss (dB, positive number). */
export function vswrToReturnLossDb(vswr: number): number {
  const g = vswrToGamma(vswr);
  if (!(g > 0)) return Infinity;
  return -20 * Math.log10(g);
}

/** Return loss (dB) → VSWR. */
export function returnLossToVswr(returnLossDb: number): number {
  const g = Math.pow(10, -returnLossDb / 20);
  return (1 + g) / (1 - g);
}

/** Mismatch loss (dB) for a given VSWR. */
export function mismatchLossDb(vswr: number): number {
  const g = vswrToGamma(vswr);
  return -10 * Math.log10(1 - g * g);
}

export interface LinkBudgetInput {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  txLossDb: number;
  rxAntennaGainDbi: number;
  rxLossDb: number;
  distanceKm: number;
  freqMHz: number;
  extraLossesDb?: number; // atmospheric, polarization, pointing, etc.
}

export interface LinkBudgetResult {
  eirpDbm: number;
  fsplDb: number;
  receivedPowerDbm: number;
}

export function linkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const eirp = input.txPowerDbm + input.txAntennaGainDbi - input.txLossDb;
  const path = fsplDb(input.distanceKm, input.freqMHz);
  const received =
    eirp - path + input.rxAntennaGainDbi - input.rxLossDb - (input.extraLossesDb ?? 0);
  return { eirpDbm: eirp, fsplDb: path, receivedPowerDbm: received };
}
