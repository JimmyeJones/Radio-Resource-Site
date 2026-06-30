export interface RfConnector {
  name: string;
  impedance: string;
  maxFreq: string;
  coupling: string;
  notes: string;
}

export const RF_CONNECTORS: RfConnector[] = [
  { name: 'SMA', impedance: '50 Ω', maxFreq: '18 GHz', coupling: 'Threaded', notes: 'Most common for SDR/test; finger-tight ~ hand-tight, torque to spec.' },
  { name: 'RP-SMA', impedance: '50 Ω', maxFreq: '18 GHz', coupling: 'Threaded', notes: 'Reverse-polarity SMA used on Wi-Fi gear; centre pin/socket swapped.' },
  { name: 'N', impedance: '50 / 75 Ω', maxFreq: '11 GHz', coupling: 'Threaded', notes: 'Weatherable, rugged; common on antennas and LMR-400.' },
  { name: 'BNC', impedance: '50 / 75 Ω', maxFreq: '4 GHz', coupling: 'Bayonet', notes: 'Quick-connect; test gear and older VHF radios.' },
  { name: 'TNC', impedance: '50 Ω', maxFreq: '11 GHz', coupling: 'Threaded', notes: 'Threaded BNC — better at vibration/microwave.' },
  { name: 'PL-259 / SO-239 (UHF)', impedance: 'Non-constant', maxFreq: '~300 MHz', coupling: 'Threaded', notes: 'Ham HF/VHF standard; not true 50 Ω, fine below ~300 MHz.' },
  { name: 'F', impedance: '75 Ω', maxFreq: '1–3 GHz', coupling: 'Threaded', notes: 'TV/satellite/cable; centre conductor is the wire itself.' },
  { name: 'SMB', impedance: '50 / 75 Ω', maxFreq: '4 GHz', coupling: 'Snap-on', notes: 'Small snap-on for internal/board RF.' },
  { name: 'MCX / MMCX', impedance: '50 Ω', maxFreq: '6 GHz', coupling: 'Snap-on', notes: 'Tiny; common SDR antenna pigtails (RTL-SDR).' },
  { name: 'U.FL / IPEX', impedance: '50 Ω', maxFreq: '6 GHz', coupling: 'Snap-on', notes: 'Board-level micro coax for Wi-Fi/GPS modules.' },
];

export interface Pinout {
  name: string;
  description: string;
  pins: { pin: string; name: string; note?: string }[];
}

export const PINOUTS: Pinout[] = [
  {
    name: 'NE555 timer (DIP-8)',
    description: 'Classic timer IC.',
    pins: [
      { pin: '1', name: 'GND' },
      { pin: '2', name: 'TRIG' },
      { pin: '3', name: 'OUT' },
      { pin: '4', name: 'RESET', note: 'active low' },
      { pin: '5', name: 'CTRL' },
      { pin: '6', name: 'THRES' },
      { pin: '7', name: 'DISCH' },
      { pin: '8', name: 'VCC' },
    ],
  },
  {
    name: 'Dual op-amp (DIP-8, e.g. NE5532)',
    description: 'Two op-amps in one package.',
    pins: [
      { pin: '1', name: 'OUT A' },
      { pin: '2', name: 'IN A−' },
      { pin: '3', name: 'IN A+' },
      { pin: '4', name: 'V−' },
      { pin: '5', name: 'IN B+' },
      { pin: '6', name: 'IN B−' },
      { pin: '7', name: 'OUT B' },
      { pin: '8', name: 'V+' },
    ],
  },
  {
    name: 'USB-A / Micro-B (power+data)',
    description: 'Standard USB 2.0 wiring.',
    pins: [
      { pin: '1', name: 'VBUS', note: '+5 V' },
      { pin: '2', name: 'D−' },
      { pin: '3', name: 'D+' },
      { pin: '4', name: 'ID', note: 'Micro only (OTG)' },
      { pin: '5', name: 'GND' },
    ],
  },
  {
    name: 'Raspberry Pi 40-pin header (key pins)',
    description: 'Common GPIO header pins.',
    pins: [
      { pin: '1', name: '3V3' },
      { pin: '2', name: '5V' },
      { pin: '4', name: '5V' },
      { pin: '6', name: 'GND' },
      { pin: '8', name: 'GPIO14 (TXD)' },
      { pin: '10', name: 'GPIO15 (RXD)' },
      { pin: '3', name: 'GPIO2 (SDA)' },
      { pin: '5', name: 'GPIO3 (SCL)' },
      { pin: '19', name: 'GPIO10 (MOSI)' },
      { pin: '21', name: 'GPIO9 (MISO)' },
      { pin: '23', name: 'GPIO11 (SCLK)' },
    ],
  },
];
