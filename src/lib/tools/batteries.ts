export interface BatteryChem {
  name: string;
  nominalV: string;
  fullV: string;
  emptyV: string;
  note: string;
}

export const BATTERY_CHEMISTRIES: BatteryChem[] = [
  { name: 'Li-ion / LiPo (per cell)', nominalV: '3.7 V', fullV: '4.20 V', emptyV: '3.0 V', note: 'Never over-discharge below ~3.0 V; store at ~3.8 V. Balance-charge multi-cell packs.' },
  { name: 'LiFePO4 (per cell)', nominalV: '3.2 V', fullV: '3.65 V', emptyV: '2.5 V', note: 'Safer, long cycle life; flatter discharge curve. 4S ≈ 12.8 V (great SLA replacement).' },
  { name: 'NiMH (per cell)', nominalV: '1.2 V', fullV: '1.45 V', emptyV: '1.0 V', note: 'Self-discharge varies; LSD types (Eneloop) hold charge well.' },
  { name: 'Alkaline (per cell)', nominalV: '1.5 V', fullV: '1.6 V', emptyV: '0.9 V', note: 'Single-use; sloping discharge. Don’t mix old/new.' },
  { name: 'Lead-acid (per cell)', nominalV: '2.0 V', fullV: '2.40 V (chg)', emptyV: '1.75 V', note: '12 V = 6 cells. Float ~13.6 V, don’t leave discharged (sulfation).' },
];

export const PACK_NOTES: { label: string; value: string }[] = [
  { label: '1S Li-ion', value: '3.0–4.2 V (3.7 nom)' },
  { label: '3S LiPo', value: '9.0–12.6 V (11.1 nom)' },
  { label: '4S LiFePO4', value: '10–14.6 V (12.8 nom)' },
  { label: '12 V SLA', value: '10.5–14.4 V (12.0 nom)' },
];
