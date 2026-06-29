import * as React from 'react';

const S: React.SVGProps<SVGSVGElement> = {
  viewBox: '0 0 80 40',
  width: 80,
  height: 40,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export interface SymbolDef {
  name: string;
  note: string;
  Svg: () => React.ReactElement;
}

const Resistor = () => (
  <svg {...S} role="img" aria-label="Resistor symbol">
    <path d="M2 20h14l4-10 8 20 8-20 8 20 4-10h14" />
  </svg>
);
const Capacitor = () => (
  <svg {...S} role="img" aria-label="Capacitor symbol">
    <path d="M2 20h32M46 20h32M34 8v24M46 8v24" />
  </svg>
);
const PolarizedCap = () => (
  <svg {...S} role="img" aria-label="Polarized capacitor symbol">
    <path d="M2 20h32M46 20h32M34 8v24" />
    <path d="M46 10c6 4 6 16 0 20" />
    <path d="M22 6h8M26 2v8" />
  </svg>
);
const Inductor = () => (
  <svg {...S} role="img" aria-label="Inductor symbol">
    <path d="M2 24h12" />
    <path d="M14 24a8 8 0 0 1 12 0M26 24a8 8 0 0 1 12 0M38 24a8 8 0 0 1 12 0M50 24a8 8 0 0 1 12 0" />
    <path d="M62 24h16" />
  </svg>
);
const Diode = () => (
  <svg {...S} role="img" aria-label="Diode symbol">
    <path d="M2 20h28M50 20h28M30 8l20 12-20 12zM50 8v24" />
  </svg>
);
const LED = () => (
  <svg {...S} role="img" aria-label="LED symbol">
    <path d="M2 20h24M50 20h28M26 8l24 12-24 12zM50 8v24" />
    <path d="M52 6l6-6M58 0h-5M58 0v5M60 12l6-6M66 6h-5M66 6v5" />
  </svg>
);
const Ground = () => (
  <svg {...S} role="img" aria-label="Ground symbol">
    <path d="M40 4v16M24 20h32M30 28h20M36 36h8" />
  </svg>
);
const Battery = () => (
  <svg {...S} role="img" aria-label="Battery symbol">
    <path d="M2 20h18M60 20h18M20 10v20M32 14v12M44 10v20M56 14v12" />
  </svg>
);
const NpnTransistor = () => (
  <svg {...S} role="img" aria-label="NPN transistor symbol">
    <circle cx="44" cy="20" r="16" />
    <path d="M20 20h12M32 10v20M32 14l16-8M32 26l16 8" />
    <path d="M44 30l-8-5 1 6z" fill="currentColor" />
  </svg>
);
const Switch = () => (
  <svg {...S} role="img" aria-label="Switch symbol">
    <path d="M2 24h20M58 24h20" />
    <circle cx="24" cy="24" r="2" />
    <circle cx="56" cy="24" r="2" />
    <path d="M24 24l28-12" />
  </svg>
);
const Crystal = () => (
  <svg {...S} role="img" aria-label="Crystal symbol">
    <path d="M2 20h22M56 20h22M24 8v24M56 8v24M32 6h16v28H32z" />
  </svg>
);
const Fuse = () => (
  <svg {...S} role="img" aria-label="Fuse symbol">
    <path d="M2 20h16M62 20h16" />
    <rect x="18" y="12" width="44" height="16" rx="8" />
    <path d="M18 20h44" />
  </svg>
);
const Potentiometer = () => (
  <svg {...S} role="img" aria-label="Potentiometer symbol">
    <path d="M2 24h10l4-10 8 20 8-20 8 20 4-10h10" />
    <path d="M40 24v-14M40 10l-4 5M40 10l4 5" />
  </svg>
);
const Antenna = () => (
  <svg {...S} role="img" aria-label="Antenna symbol">
    <path d="M40 38V16M40 16l-12-12M40 16l12-12M40 16l0-12" />
  </svg>
);
const OpAmp = () => (
  <svg {...S} role="img" aria-label="Op-amp symbol">
    <path d="M22 6v28l34-14z" />
    <path d="M2 14h20M2 26h20M56 20h22" />
    <path d="M26 14h6M29 11v6M27 26h6" />
  </svg>
);
const Transformer = () => (
  <svg {...S} role="img" aria-label="Transformer symbol">
    <path d="M30 6a7 7 0 0 1 0 12 7 7 0 0 1 0 12 7 7 0 0 1 0-4M50 6a7 7 0 0 0 0 12 7 7 0 0 0 0 12" />
    <path d="M38 4v32M42 4v32" />
  </svg>
);

export const SCHEMATIC_SYMBOLS: SymbolDef[] = [
  { name: 'Resistor', note: 'Fixed resistance (zig-zag = US, box = IEC).', Svg: Resistor },
  { name: 'Potentiometer', note: 'Variable resistor / divider with a wiper.', Svg: Potentiometer },
  { name: 'Capacitor', note: 'Non-polarized capacitor.', Svg: Capacitor },
  { name: 'Polarized cap', note: 'Electrolytic; observe + terminal.', Svg: PolarizedCap },
  { name: 'Inductor', note: 'Coil / choke.', Svg: Inductor },
  { name: 'Transformer', note: 'Coupled inductors; bars = core.', Svg: Transformer },
  { name: 'Diode', note: 'Conducts in the arrow direction; bar = cathode.', Svg: Diode },
  { name: 'LED', note: 'Light-emitting diode.', Svg: LED },
  { name: 'NPN transistor', note: 'Arrow on emitter points out.', Svg: NpnTransistor },
  { name: 'Op-amp', note: '+ non-inverting, − inverting input.', Svg: OpAmp },
  { name: 'Crystal', note: 'Quartz resonator.', Svg: Crystal },
  { name: 'Fuse', note: 'Overcurrent protection.', Svg: Fuse },
  { name: 'Switch', note: 'Single-pole single-throw.', Svg: Switch },
  { name: 'Battery', note: 'Long line = +, short = −.', Svg: Battery },
  { name: 'Ground', note: 'Common / 0 V reference.', Svg: Ground },
  { name: 'Antenna', note: 'RF antenna connection.', Svg: Antenna },
];
