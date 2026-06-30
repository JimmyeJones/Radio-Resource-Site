export interface MpeRow {
  range: string;
  occupationalMwCm2: string;
  publicMwCm2: string;
}

// FCC OET-65 Maximum Permissible Exposure (power density) summary.
export const MPE_LIMITS: MpeRow[] = [
  { range: '0.3–3 MHz', occupationalMwCm2: '100', publicMwCm2: '100' },
  { range: '3–30 MHz', occupationalMwCm2: '900/f²', publicMwCm2: '180/f²' },
  { range: '30–300 MHz', occupationalMwCm2: '1.0', publicMwCm2: '0.2' },
  { range: '300–1500 MHz', occupationalMwCm2: 'f/300', publicMwCm2: 'f/1500' },
  { range: '1500–100000 MHz', occupationalMwCm2: '5.0', publicMwCm2: '1.0' },
];

export const SAFETY_NOTES: string[] = [
  'f is frequency in MHz. Occupational limits assume a controlled environment with awareness/training; public limits apply otherwise.',
  'Limits are averaged over 6 minutes (occupational) or 30 minutes (public).',
  'VHF (30–300 MHz) is the most restrictive region because the human body resonates there.',
  'Since 2021 the FCC requires all US amateurs to perform a routine RF-exposure evaluation for their stations.',
  'Keep antennas away from where people spend time; height and distance are your friends. Don’t transmit into a handheld held against the head at high power.',
];
