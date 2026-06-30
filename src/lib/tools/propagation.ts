export type Condition = 'Poor' | 'Fair' | 'Good';

export interface BandCondition {
  band: string;
  day: Condition;
  night: Condition;
}

/**
 * Very simplified HF band-condition heuristic from solar flux (SFI) and the
 * planetary K index, in the spirit of the hamqsl.com summary. Not a substitute
 * for real-time propagation tools — just a quick at-a-glance estimate.
 */
export function bandConditions(sfi: number | null, kIndex: number | null): BandCondition[] {
  const flux = sfi ?? 70;
  const k = kIndex ?? 3;

  // Geomagnetic disturbance knocks conditions down, worse on low bands at night.
  const kPenalty = k >= 5 ? 2 : k >= 4 ? 1 : 0;

  function grade(score: number): Condition {
    const s = score - kPenalty;
    if (s >= 2) return 'Good';
    if (s >= 1) return 'Fair';
    return 'Poor';
  }

  // Higher bands need higher flux to open; lower bands favor night.
  const highScore = flux >= 150 ? 3 : flux >= 110 ? 2 : flux >= 90 ? 1 : 0;
  const midScore = flux >= 110 ? 3 : flux >= 80 ? 2 : 1;
  const lowDay = 1;
  const lowNight = 3;

  return [
    { band: '80m–40m', day: grade(lowDay), night: grade(lowNight) },
    { band: '30m–20m', day: grade(midScore), night: grade(midScore - 1 + 1) },
    { band: '17m–15m', day: grade(highScore), night: grade(highScore - 1) },
    { band: '12m–10m', day: grade(highScore), night: grade(Math.max(0, highScore - 2)) },
  ];
}

export const CONDITION_TONE: Record<Condition, 'success' | 'warning' | 'danger'> = {
  Good: 'success',
  Fair: 'warning',
  Poor: 'danger',
};
