export interface IcEntry {
  part: string;
  category: string;
  description: string;
  keySpecs: string;
}

export const ICS: IcEntry[] = [
  { part: '7805 / 78xx', category: 'Linear regulator', description: 'Fixed positive regulator (05/09/12/15 V).', keySpecs: 'Up to 1 A · Vin ≤ 35 V · ~2 V dropout · TO-220: 1=IN 2=GND 3=OUT' },
  { part: '7905 / 79xx', category: 'Linear regulator', description: 'Fixed negative regulator.', keySpecs: 'TO-220: 1=GND 2=IN 3=OUT (differs from 78xx!)' },
  { part: 'LM317', category: 'Linear regulator', description: 'Adjustable positive regulator.', keySpecs: 'Vout = 1.25(1+R2/R1) · 1.5 A · ADJ/OUT/IN' },
  { part: 'AMS1117', category: 'LDO regulator', description: 'Low-dropout 3.3 V (and adj) regulator.', keySpecs: '1 A · ~1.1 V dropout · SOT-223' },
  { part: 'NE555', category: 'Timer', description: 'Astable/monostable timer.', keySpecs: '4.5–15 V · DIP-8 · see Pinouts tool' },
  { part: 'LM358', category: 'Op-amp (dual)', description: 'Dual single-supply op-amp.', keySpecs: '3–32 V · low cost · not rail-to-rail' },
  { part: 'TL072', category: 'Op-amp (dual)', description: 'Low-noise JFET op-amp, audio.', keySpecs: '±18 V · high input impedance' },
  { part: 'LM386', category: 'Audio amp', description: 'Small audio power amplifier.', keySpecs: '0.3–1 W · gain 20–200 · 4–12 V' },
  { part: '74HC00', category: 'Logic', description: 'Quad 2-input NAND (HC family).', keySpecs: '2–6 V · ~25 ns' },
  { part: '74HC595', category: 'Logic', description: '8-bit serial-in, parallel-out shift register.', keySpecs: 'Cascadable · common for LED/IO expansion' },
  { part: '74HC165', category: 'Logic', description: '8-bit parallel-in, serial-out shift register.', keySpecs: 'Input expansion' },
  { part: 'ULN2003', category: 'Driver', description: 'Darlington array (7 channels).', keySpecs: '500 mA/ch · relays/steppers · built-in flyback diodes' },
  { part: 'MAX232', category: 'Interface', description: 'RS-232 to TTL level converter.', keySpecs: 'Charge-pump ±10 V from 5 V' },
  { part: 'ATmega328P', category: 'MCU', description: '8-bit AVR (Arduino Uno).', keySpecs: '32 KB flash · 16 MHz · 23 I/O' },
];
