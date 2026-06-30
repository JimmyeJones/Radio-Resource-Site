export interface CoaxRef {
  name: string;
  impedanceOhm: number;
  velocityFactor: number;
  outerMm: number;
  // loss in dB/100ft at reference frequencies
  loss: { mhz: number; db: number }[];
  powerW100MHz: string;
  use: string;
}

export const COAX_REF: CoaxRef[] = [
  { name: 'RG-174', impedanceOhm: 50, velocityFactor: 0.66, outerMm: 2.8, loss: [{ mhz: 30, db: 3.3 }, { mhz: 150, db: 8.0 }, { mhz: 450, db: 14.0 }, { mhz: 1000, db: 22.0 }], powerW100MHz: '~120 W', use: 'Thin patch/jumper, low power.' },
  { name: 'RG-58', impedanceOhm: 50, velocityFactor: 0.66, outerMm: 5.0, loss: [{ mhz: 30, db: 2.5 }, { mhz: 150, db: 6.2 }, { mhz: 450, db: 11.2 }, { mhz: 1000, db: 17.5 }], powerW100MHz: '~350 W', use: 'General hookup, short VHF runs.' },
  { name: 'RG-8X', impedanceOhm: 50, velocityFactor: 0.82, outerMm: 6.0, loss: [{ mhz: 30, db: 1.9 }, { mhz: 150, db: 4.5 }, { mhz: 450, db: 8.0 }, { mhz: 1000, db: 12.6 }], powerW100MHz: '~600 W', use: '“Mini-8”, portable HF/VHF.' },
  { name: 'RG-213', impedanceOhm: 50, velocityFactor: 0.66, outerMm: 10.3, loss: [{ mhz: 30, db: 1.2 }, { mhz: 150, db: 2.8 }, { mhz: 450, db: 5.2 }, { mhz: 1000, db: 8.3 }], powerW100MHz: '~1.8 kW', use: 'Workhorse HF feedline.' },
  { name: 'LMR-240', impedanceOhm: 50, velocityFactor: 0.84, outerMm: 6.1, loss: [{ mhz: 30, db: 1.3 }, { mhz: 150, db: 3.0 }, { mhz: 450, db: 5.3 }, { mhz: 1000, db: 8.0 }], powerW100MHz: '~900 W', use: 'Low-loss RG-8X replacement.' },
  { name: 'LMR-400', impedanceOhm: 50, velocityFactor: 0.85, outerMm: 10.3, loss: [{ mhz: 30, db: 0.7 }, { mhz: 150, db: 1.5 }, { mhz: 450, db: 2.7 }, { mhz: 1000, db: 4.1 }], powerW100MHz: '~1.5 kW', use: 'Low-loss VHF/UHF runs.' },
  { name: 'LMR-600', impedanceOhm: 50, velocityFactor: 0.87, outerMm: 15.0, loss: [{ mhz: 30, db: 0.4 }, { mhz: 150, db: 1.0 }, { mhz: 450, db: 1.7 }, { mhz: 1000, db: 2.7 }], powerW100MHz: '~3 kW', use: 'Long UHF/microwave runs.' },
  { name: 'Hardline 1/2"', impedanceOhm: 50, velocityFactor: 0.88, outerMm: 13.0, loss: [{ mhz: 30, db: 0.3 }, { mhz: 150, db: 0.8 }, { mhz: 450, db: 1.3 }, { mhz: 1000, db: 2.0 }], powerW100MHz: 'very high', use: 'Tower/repeater feed, lowest loss.' },
  { name: 'RG-6 (75Ω)', impedanceOhm: 75, velocityFactor: 0.85, outerMm: 6.9, loss: [{ mhz: 30, db: 1.5 }, { mhz: 150, db: 3.0 }, { mhz: 450, db: 5.5 }, { mhz: 1000, db: 8.0 }], powerW100MHz: 'low', use: 'TV/satellite, RX-only ham use.' },
];
