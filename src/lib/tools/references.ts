// Static reference tables shared across several reference pages.

export interface BandDesignation {
  name: string;
  range: string;
  system: 'ITU' | 'IEEE radar' | 'NATO/EU';
  use: string;
}

export const BAND_DESIGNATIONS: BandDesignation[] = [
  { name: 'VLF', range: '3–30 kHz', system: 'ITU', use: 'Navigation, submarine comms' },
  { name: 'LF', range: '30–300 kHz', system: 'ITU', use: 'Longwave broadcast, time signals' },
  { name: 'MF', range: '300 kHz–3 MHz', system: 'ITU', use: 'AM broadcast, 160m/630m' },
  { name: 'HF', range: '3–30 MHz', system: 'ITU', use: 'Shortwave, most ham DX' },
  { name: 'VHF', range: '30–300 MHz', system: 'ITU', use: 'FM broadcast, 6m/2m, air band' },
  { name: 'UHF', range: '300 MHz–3 GHz', system: 'ITU', use: '70cm, TV, cellular, Wi-Fi 2.4G' },
  { name: 'SHF', range: '3–30 GHz', system: 'ITU', use: 'Satellite, radar, Wi-Fi 5G' },
  { name: 'EHF', range: '30–300 GHz', system: 'ITU', use: 'mmWave, radio astronomy' },
  { name: 'L band', range: '1–2 GHz', system: 'IEEE radar', use: 'GPS, Inmarsat, ADS-B, weather sats' },
  { name: 'S band', range: '2–4 GHz', system: 'IEEE radar', use: 'Weather radar, 2.4 GHz, QO-100 down' },
  { name: 'C band', range: '4–8 GHz', system: 'IEEE radar', use: 'Satellite TV/data, Wi-Fi 5 GHz' },
  { name: 'X band', range: '8–12 GHz', system: 'IEEE radar', use: 'Radar, military satcom, QO-100 up' },
  { name: 'Ku band', range: '12–18 GHz', system: 'IEEE radar', use: 'Satellite TV/VSAT' },
  { name: 'K band', range: '18–27 GHz', system: 'IEEE radar', use: 'Radar (absorbed by water vapor)' },
  { name: 'Ka band', range: '27–40 GHz', system: 'IEEE radar', use: 'High-throughput satellite, 5G mmWave' },
];

export interface DigitalMode {
  name: string;
  type: string;
  bandwidth: string;
  use: string;
}

export const DIGITAL_MODES: DigitalMode[] = [
  { name: 'FT8', type: '8-FSK, 15 s', bandwidth: '50 Hz', use: 'Weak-signal QSOs, very popular' },
  { name: 'FT4', type: '4-FSK, 7.5 s', bandwidth: '90 Hz', use: 'Faster contest version of FT8' },
  { name: 'JS8', type: '8-FSK', bandwidth: '50 Hz', use: 'Keyboard chat/messaging on weak signals' },
  { name: 'WSPR', type: '4-FSK', bandwidth: '6 Hz', use: 'Propagation beacons' },
  { name: 'PSK31', type: 'BPSK', bandwidth: '31 Hz', use: 'Keyboard QSO chat' },
  { name: 'RTTY', type: 'FSK 170 Hz shift', bandwidth: '~250 Hz', use: 'Teletype, contesting' },
  { name: 'Olivia', type: 'MFSK', bandwidth: '125–2000 Hz', use: 'Robust weak-signal text' },
  { name: 'VARA / Winlink', type: 'OFDM', bandwidth: '~500 Hz–2.4 kHz', use: 'Email over radio' },
  { name: 'SSTV', type: 'Analog FM subcarrier', bandwidth: '~2.4 kHz', use: 'Slow-scan TV images' },
];

export interface SMeterRow {
  s: string;
  dbm: number;
  uv50: number; // µV into 50Ω
}

// S-units at HF: S9 = -73 dBm = 50 µV; 6 dB per S-unit.
export const S_METER: SMeterRow[] = Array.from({ length: 10 }, (_, i) => {
  const s = i; // S0..S9
  const dbm = -127 + s * 6; // S0 = -127 dBm
  const uv50 = Math.sqrt(Math.pow(10, dbm / 10) * 1e-3 * 50) * 1e6;
  return { s: `S${s}`, dbm, uv50 };
}).concat(
  [20, 40, 60].map((over) => {
    const dbm = -73 + over;
    const uv50 = Math.sqrt(Math.pow(10, dbm / 10) * 1e-3 * 50) * 1e6;
    return { s: `S9+${over}`, dbm, uv50 };
  }),
);

export const DB_RATIOS: { db: number; power: string; voltage: string }[] = [
  { db: 1, power: '1.26×', voltage: '1.12×' },
  { db: 3, power: '2×', voltage: '1.41×' },
  { db: 6, power: '4×', voltage: '2×' },
  { db: 10, power: '10×', voltage: '3.16×' },
  { db: 20, power: '100×', voltage: '10×' },
  { db: 30, power: '1000×', voltage: '31.6×' },
];

// E-series standard component values (one decade).
export const E_SERIES: Record<string, number[]> = {
  E12: [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2],
  E24: [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1],
};

export interface AwgRow {
  awg: number;
  diaMm: number;
  ohmPerKm: number;
  ampsChassis: number;
}

export const AWG_TABLE: AwgRow[] = [
  { awg: 10, diaMm: 2.588, ohmPerKm: 3.277, ampsChassis: 55 },
  { awg: 12, diaMm: 2.053, ohmPerKm: 5.211, ampsChassis: 41 },
  { awg: 14, diaMm: 1.628, ohmPerKm: 8.286, ampsChassis: 32 },
  { awg: 16, diaMm: 1.291, ohmPerKm: 13.17, ampsChassis: 22 },
  { awg: 18, diaMm: 1.024, ohmPerKm: 20.95, ampsChassis: 16 },
  { awg: 20, diaMm: 0.812, ohmPerKm: 33.31, ampsChassis: 11 },
  { awg: 22, diaMm: 0.644, ohmPerKm: 52.96, ampsChassis: 7 },
  { awg: 24, diaMm: 0.511, ohmPerKm: 84.22, ampsChassis: 3.5 },
  { awg: 26, diaMm: 0.405, ohmPerKm: 133.9, ampsChassis: 2.2 },
  { awg: 28, diaMm: 0.321, ohmPerKm: 212.9, ampsChassis: 1.4 },
];

export const SMD_SIZES: { code: string; imperial: string; metric: string; mm: string }[] = [
  { code: '0201', imperial: '0201', metric: '0603', mm: '0.6 × 0.3' },
  { code: '0402', imperial: '0402', metric: '1005', mm: '1.0 × 0.5' },
  { code: '0603', imperial: '0603', metric: '1608', mm: '1.6 × 0.8' },
  { code: '0805', imperial: '0805', metric: '2012', mm: '2.0 × 1.25' },
  { code: '1206', imperial: '1206', metric: '3216', mm: '3.2 × 1.6' },
  { code: '1210', imperial: '1210', metric: '3225', mm: '3.2 × 2.5' },
  { code: '2010', imperial: '2010', metric: '5025', mm: '5.0 × 2.5' },
  { code: '2512', imperial: '2512', metric: '6332', mm: '6.3 × 3.2' },
];
