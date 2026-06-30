// ITU emission designator decoder (the three core characters).

export const MODULATION: Record<string, string> = {
  N: 'Unmodulated carrier',
  A: 'Amplitude modulation (double sideband)',
  H: 'AM, single sideband, full carrier',
  R: 'AM, single sideband, reduced/variable carrier',
  J: 'AM, single sideband, suppressed carrier (SSB)',
  B: 'AM, independent sidebands',
  C: 'AM, vestigial sideband',
  F: 'Frequency modulation',
  G: 'Phase modulation',
  D: 'Combination of AM and angle modulation',
  P: 'Sequence of unmodulated pulses',
  K: 'Pulse, amplitude modulated',
  L: 'Pulse, width modulated',
  M: 'Pulse, phase/position modulated',
};

export const SIGNAL: Record<string, string> = {
  '0': 'No modulating signal',
  '1': 'Single digital channel, no subcarrier',
  '2': 'Single digital channel with subcarrier',
  '3': 'Single analog channel',
  '7': 'Two or more digital channels',
  '8': 'Two or more analog channels',
  '9': 'Composite (analog + digital)',
};

export const INFORMATION: Record<string, string> = {
  N: 'No information',
  A: 'Telegraphy (aural / by ear)',
  B: 'Telegraphy (automatic reception)',
  C: 'Facsimile',
  D: 'Data, telemetry, telecommand',
  E: 'Telephony (voice)',
  F: 'Video / television',
  W: 'Combination of the above',
};

export interface DecodedEmission {
  modulation: string;
  signal: string;
  information: string;
}

/** Decode the three-character core of an ITU emission designator, e.g. "F3E". */
export function decodeEmission(code: string): DecodedEmission | null {
  const c = code.trim().toUpperCase();
  // Accept optional leading bandwidth (e.g. "16K0F3E") — take the last 3 chars.
  const core = c.length > 3 ? c.slice(-3) : c;
  if (core.length !== 3) return null;
  const m = MODULATION[core[0]];
  const s = SIGNAL[core[1]];
  const i = INFORMATION[core[2]];
  if (!m || !s || !i) return null;
  return { modulation: m, signal: s, information: i };
}

export const COMMON_EMISSIONS: { code: string; meaning: string }[] = [
  { code: 'A1A', meaning: 'CW Morse telegraphy (on/off keyed)' },
  { code: 'J3E', meaning: 'SSB voice (suppressed carrier)' },
  { code: 'A3E', meaning: 'AM voice (double sideband)' },
  { code: 'F3E', meaning: 'FM voice' },
  { code: 'F1B', meaning: 'FSK telegraphy (RTTY)' },
  { code: 'J2B', meaning: 'SSB data with subcarrier (PSK31, FT8 via SSB)' },
  { code: 'F2D', meaning: 'FM data (e.g. packet/APRS)' },
  { code: 'C3F', meaning: 'Vestigial-sideband analog TV' },
  { code: 'G7W', meaning: 'Phase-modulated multi-channel digital (some digital voice)' },
  { code: 'N0N', meaning: 'Unmodulated carrier (beacon/test)' },
];
