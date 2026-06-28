export type LicenseClass = 'novice' | 'technician' | 'general' | 'advanced' | 'extra';
export type Mode = 'CW' | 'Phone' | 'Digital' | 'Image' | 'RTTY/Data' | 'CW/Digital';

export interface BandSegment {
  startKHz: number;
  endKHz: number;
  modes: Mode[];
  classes: LicenseClass[];
  note?: string;
}

export interface Band {
  name: string;
  startKHz: number;
  endKHz: number;
  segments: BandSegment[];
  note?: string;
}

// US amateur band plan, simplified from FCC Part 97 / ARRL summary.
// All frequencies in kHz.
export const BANDS: Band[] = [
  {
    name: '160 m',
    startKHz: 1800,
    endKHz: 2000,
    segments: [
      { startKHz: 1800, endKHz: 2000, modes: ['CW'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 1800, endKHz: 2000, modes: ['Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
    ],
  },
  {
    name: '80 m',
    startKHz: 3500,
    endKHz: 4000,
    segments: [
      { startKHz: 3500, endKHz: 3600, modes: ['CW'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 3525, endKHz: 3600, modes: ['CW'], classes: ['novice', 'technician'], note: 'CW only, 200W max' },
      { startKHz: 3600, endKHz: 3700, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 3700, endKHz: 3800, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 3800, endKHz: 4000, modes: ['CW', 'Phone', 'Image'], classes: ['advanced', 'extra'] },
    ],
  },
  {
    name: '60 m',
    startKHz: 5330.5,
    endKHz: 5406.4,
    segments: [
      {
        startKHz: 5330.5,
        endKHz: 5406.4,
        modes: ['CW', 'Phone', 'RTTY/Data'],
        classes: ['general', 'advanced', 'extra'],
        note: 'Channelized: 5 USB-only channels, 100W ERP',
      },
    ],
  },
  {
    name: '40 m',
    startKHz: 7000,
    endKHz: 7300,
    segments: [
      { startKHz: 7000, endKHz: 7125, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 7025, endKHz: 7125, modes: ['CW'], classes: ['novice', 'technician'], note: 'CW only, 200W max' },
      { startKHz: 7125, endKHz: 7300, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 7175, endKHz: 7300, modes: ['CW', 'Phone', 'Image'], classes: ['advanced', 'extra'] },
    ],
  },
  {
    name: '30 m',
    startKHz: 10100,
    endKHz: 10150,
    segments: [
      {
        startKHz: 10100,
        endKHz: 10150,
        modes: ['CW', 'RTTY/Data'],
        classes: ['general', 'advanced', 'extra'],
        note: 'No phone or images. 200W max.',
      },
    ],
  },
  {
    name: '20 m',
    startKHz: 14000,
    endKHz: 14350,
    segments: [
      { startKHz: 14000, endKHz: 14150, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 14150, endKHz: 14350, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 14225, endKHz: 14350, modes: ['CW', 'Phone', 'Image'], classes: ['advanced', 'extra'] },
    ],
  },
  {
    name: '17 m',
    startKHz: 18068,
    endKHz: 18168,
    segments: [
      { startKHz: 18068, endKHz: 18110, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 18110, endKHz: 18168, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
    ],
  },
  {
    name: '15 m',
    startKHz: 21000,
    endKHz: 21450,
    segments: [
      { startKHz: 21000, endKHz: 21200, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 21025, endKHz: 21200, modes: ['CW'], classes: ['novice', 'technician'], note: 'CW only, 200W max' },
      { startKHz: 21200, endKHz: 21450, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 21275, endKHz: 21450, modes: ['CW', 'Phone', 'Image'], classes: ['advanced', 'extra'] },
    ],
  },
  {
    name: '12 m',
    startKHz: 24890,
    endKHz: 24990,
    segments: [
      { startKHz: 24890, endKHz: 24930, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 24930, endKHz: 24990, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
    ],
  },
  {
    name: '10 m',
    startKHz: 28000,
    endKHz: 29700,
    segments: [
      { startKHz: 28000, endKHz: 28300, modes: ['CW', 'RTTY/Data'], classes: ['general', 'advanced', 'extra'] },
      { startKHz: 28000, endKHz: 28300, modes: ['CW', 'RTTY/Data'], classes: ['novice', 'technician'], note: '200W max' },
      { startKHz: 28300, endKHz: 28500, modes: ['CW', 'Phone'], classes: ['novice', 'technician'], note: '200W max' },
      { startKHz: 28300, endKHz: 29700, modes: ['CW', 'Phone', 'Image'], classes: ['general', 'advanced', 'extra'] },
    ],
  },
  {
    name: '6 m',
    startKHz: 50000,
    endKHz: 54000,
    segments: [
      {
        startKHz: 50000,
        endKHz: 54000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
  {
    name: '2 m',
    startKHz: 144000,
    endKHz: 148000,
    segments: [
      { startKHz: 144000, endKHz: 144100, modes: ['CW'], classes: ['technician', 'general', 'advanced', 'extra'] },
      {
        startKHz: 144100,
        endKHz: 148000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
  {
    name: '1.25 m',
    startKHz: 222000,
    endKHz: 225000,
    segments: [
      {
        startKHz: 222000,
        endKHz: 225000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
  {
    name: '70 cm',
    startKHz: 420000,
    endKHz: 450000,
    segments: [
      {
        startKHz: 420000,
        endKHz: 450000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
  {
    name: '33 cm',
    startKHz: 902000,
    endKHz: 928000,
    segments: [
      {
        startKHz: 902000,
        endKHz: 928000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
  {
    name: '23 cm',
    startKHz: 1240000,
    endKHz: 1300000,
    segments: [
      {
        startKHz: 1240000,
        endKHz: 1300000,
        modes: ['CW', 'Phone', 'Image', 'RTTY/Data'],
        classes: ['technician', 'general', 'advanced', 'extra'],
      },
    ],
  },
];

export function formatFreq(khz: number): string {
  if (khz >= 1000) {
    const mhz = khz / 1000;
    // Up to 3 decimals, drop trailing zeros: 3500 -> "3.5 MHz", 14000 -> "14 MHz", 5330.5 -> "5.3305 MHz".
    const s = (Math.round(mhz * 10000) / 10000).toString();
    return `${s} MHz`;
  }
  return `${khz.toFixed(khz % 1 === 0 ? 0 : 1)} kHz`;
}

export const LICENSE_LABELS: Record<LicenseClass, string> = {
  novice: 'Novice',
  technician: 'Technician',
  general: 'General',
  advanced: 'Advanced',
  extra: 'Amateur Extra',
};
