export interface LogicFamily {
  family: string;
  vih: string;
  vil: string;
  voh: string;
  vol: string;
  note: string;
}

export const LOGIC_LEVELS: LogicFamily[] = [
  { family: '5V TTL', vih: '≥ 2.0 V', vil: '≤ 0.8 V', voh: '≥ 2.4 V', vol: '≤ 0.4 V', note: 'Classic 74LS' },
  { family: '5V CMOS (HC)', vih: '≥ 3.5 V', vil: '≤ 1.5 V', voh: '≈ 4.9 V', vol: '≈ 0.1 V', note: '~70% of Vcc thresholds' },
  { family: '3.3V LVCMOS', vih: '≥ 2.0 V', vil: '≤ 0.8 V', voh: '≥ 2.4 V', vol: '≤ 0.4 V', note: 'Most modern MCUs' },
  { family: '1.8V CMOS', vih: '≥ 1.17 V', vil: '≤ 0.63 V', voh: '≥ 1.35 V', vol: '≤ 0.45 V', note: 'Low-power cores' },
];

export interface BusSpec {
  name: string;
  type: string;
  speed: string;
  wires: string;
  note: string;
}

export const BUSES: BusSpec[] = [
  { name: 'UART', type: 'Async serial', speed: 'commonly 9.6k–921.6k baud', wires: 'TX, RX (+GND)', note: 'No clock; both ends set the same baud.' },
  { name: 'RS-232', type: 'Single-ended serial', speed: 'up to ~115.2k', wires: 'TX, RX, GND (+handshake)', note: '±3 to ±15 V; needs a level shifter (MAX232) to talk to TTL.' },
  { name: 'RS-485', type: 'Differential serial', speed: 'up to 10 Mb/s', wires: 'A, B (+GND)', note: 'Multidrop, long runs, noise-immune; half/full duplex.' },
  { name: 'I²C', type: 'Sync, multi-drop', speed: '100k/400k/1M', wires: 'SDA, SCL (+pull-ups)', note: 'Addressed devices; open-drain, needs pull-up resistors.' },
  { name: 'SPI', type: 'Sync, full-duplex', speed: 'tens of MHz', wires: 'SCLK, MOSI, MISO, CS', note: 'One CS per peripheral; fast, no addressing.' },
  { name: '1-Wire', type: 'Sync, single data', speed: '~15.4 kb/s', wires: 'DQ (+GND, parasitic power)', note: 'DS18B20 temp sensors etc.; one pull-up.' },
  { name: 'CAN', type: 'Differential bus', speed: 'up to 1 Mb/s (CAN FD faster)', wires: 'CANH, CANL', note: 'Automotive/industrial; robust arbitration.' },
  { name: 'USB 2.0', type: 'Differential serial', speed: '1.5/12/480 Mb/s', wires: 'D+, D−, VBUS, GND', note: 'Host-controlled; NRZI on a differential pair.' },
];
