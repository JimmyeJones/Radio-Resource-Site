import type { LucideIcon } from 'lucide-react';
import {
  Radio, BookOpen, Compass, Satellite, AudioLines, CircuitBoard, Antenna, Signal,
  Waves, Gauge, Binary, Zap, Table, Calculator, Plug, Sun, GraduationCap, RadioTower,
  Clock, MapPin, ShieldAlert, Cable, Cpu, GitBranch, BatteryCharging, Network,
} from 'lucide-react';

export interface ToolEntry {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export interface ToolSection {
  label: string;
  tools: ToolEntry[];
}

// Single source of truth for the reference tools — consumed by the /tools index
// and the command palette so they never drift.
export const TOOL_SECTIONS: ToolSection[] = [
  {
    label: 'Ham operating',
    tools: [
      { href: '/tools/band-plan', title: 'US Amateur Band Plan', description: 'Browse 160 m through 23 cm with mode and license-class detail.', Icon: Radio },
      { href: '/tools/operating-frequencies', title: 'Operating Frequencies', description: 'Calling, simplex, and digital dial frequencies by band.', Icon: RadioTower },
      { href: '/tools/tones', title: 'CTCSS / DCS Tones', description: 'PL tone frequencies and DCS codes for repeater access.', Icon: Waves },
      { href: '/tools/q-codes', title: 'Q-codes', description: 'Searchable reference for common amateur Q-signals.', Icon: BookOpen },
      { href: '/tools/phonetics', title: 'Phonetic Alphabet', description: 'NATO/ITU table plus a callsign speller.', Icon: AudioLines },
      { href: '/tools/cw', title: 'CW Reference & Trainer', description: 'Morse table, audio trainer, the RST system, and prosigns.', Icon: Zap },
      { href: '/tools/prefix', title: 'Callsign Prefix Lookup', description: 'Country and CQ/ITU zones for any callsign.', Icon: Compass },
      { href: '/tools/emissions', title: 'Emission Designators', description: 'Decode ITU emission codes like F3E, A1A, J3E.', Icon: Binary },
    ],
  },
  {
    label: 'Satellites & SDR',
    tools: [
      { href: '/map', title: 'Live World Map', description: 'Grey-line terminator and real-time satellite tracking.', Icon: MapPin },
      { href: '/tools/satellites', title: 'Satellite Pass Predictions', description: 'Next passes for the ISS, amateur, and weather satellites.', Icon: Satellite },
      { href: '/tools/sat-frequencies', title: 'Satellite Modes & Frequencies', description: 'Mode notation, uplink/downlink list, and resources.', Icon: Satellite },
      { href: '/tools/signals', title: 'Signal ID Reference', description: 'Identify signals on a waterfall: APT, ADS-B, FT8, AIS…', Icon: Waves },
      { href: '/tools/propagation', title: 'Propagation & Space Weather', description: 'Solar flux, K-index, and an HF band-condition estimate.', Icon: Sun },
      { href: '/tools/propagation-modes', title: 'Propagation Modes', description: 'Sporadic-E, F2, grey-line, meteor scatter, tropo, aurora.', Icon: Signal },
    ],
  },
  {
    label: 'Antennas & RF',
    tools: [
      { href: '/tools/antenna', title: 'Antenna & Feed Calculator', description: 'Dipole/vertical, dish gain & geometry, waveguide, coax loss.', Icon: Antenna },
      { href: '/tools/antenna-types', title: 'Antenna Types & Gain', description: 'Typical gain, pattern, and use for common antennas.', Icon: Antenna },
      { href: '/tools/coax', title: 'Coax Cable Comparison', description: 'Impedance, velocity factor, loss, and power by cable.', Icon: Cable },
      { href: '/tools/link-budget', title: 'RF Link Budget', description: 'Path loss, link budget, dBm/watt and VSWR conversions.', Icon: Signal },
      { href: '/tools/gain', title: 'Gain & ERP / EIRP', description: 'Convert dBi↔dBd and compute effective radiated power.', Icon: Gauge },
      { href: '/tools/band-designations', title: 'Band Designations', description: 'ITU plus IEEE radar/microwave letter bands (L–Ka).', Icon: Signal },
      { href: '/tools/s-meter', title: 'dB & S-meter', description: 'S-units to dBm/µV and quick dB power/voltage ratios.', Icon: Gauge },
      { href: '/tools/rf-safety', title: 'RF Exposure & Safety', description: 'FCC MPE limits and safe-distance rules of thumb.', Icon: ShieldAlert },
    ],
  },
  {
    label: 'Electronics & PCB',
    tools: [
      { href: '/tools/pcb', title: 'PCB Calculator', description: 'IPC-2221 trace current, microstrip/stripline, via capacity.', Icon: CircuitBoard },
      { href: '/tools/electronics', title: 'Electronics Calculators', description: 'Resistor/cap/SMD codes, Ohm’s law, filters, 555.', Icon: Calculator },
      { href: '/tools/ics', title: 'Common ICs & Regulators', description: '78xx, LM317, 555, 74xx, op-amps — specs and gotchas.', Icon: Cpu },
      { href: '/tools/pinouts', title: 'Connectors & Pinouts', description: 'RF connector reference plus common IC/header pinouts.', Icon: Plug },
      { href: '/tools/interfaces', title: 'Logic & Interface Levels', description: 'TTL/CMOS thresholds and serial bus signaling.', Icon: Network },
      { href: '/tools/symbols', title: 'Schematic Symbols', description: 'A visual key to common component symbols.', Icon: GitBranch },
      { href: '/tools/batteries', title: 'Battery Reference', description: 'Cell voltages and care notes for common chemistries.', Icon: BatteryCharging },
      { href: '/tools/references', title: 'Electronics Tables', description: 'E-series values, AWG wire, and SMD package sizes.', Icon: Table },
    ],
  },
  {
    label: 'Geo, time & study',
    tools: [
      { href: '/tools/grid', title: 'Maidenhead Grid Tools', description: 'Grid↔lat/lon and distance/bearing between grids.', Icon: MapPin },
      { href: '/tools/time', title: 'UTC & Time Signals', description: 'A live Zulu clock and standard time-signal stations.', Icon: Clock },
      { href: '/tools/digital-modes', title: 'Digital Modes', description: 'FT8, PSK31, RTTY, WSPR — bandwidth and typical use.', Icon: Binary },
      { href: '/study', title: 'License Study', description: 'Flashcards and scored practice tests for the exam.', Icon: GraduationCap },
    ],
  },
];

export const ALL_TOOLS: ToolEntry[] = TOOL_SECTIONS.flatMap((s) => s.tools);
