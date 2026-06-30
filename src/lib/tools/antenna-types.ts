export interface AntennaType {
  name: string;
  gain: string;
  pattern: string;
  polarization: string;
  use: string;
}

export const ANTENNA_TYPES: AntennaType[] = [
  { name: 'Isotropic (reference)', gain: '0 dBi', pattern: 'Perfect sphere (theoretical)', polarization: '—', use: 'The reference for dBi; not buildable.' },
  { name: '½λ dipole', gain: '2.15 dBi (0 dBd)', pattern: 'Figure-8 broadside', polarization: 'Linear', use: 'The reference antenna; simple and effective.' },
  { name: '¼λ ground plane / vertical', gain: '~0–1 dBd', pattern: 'Omnidirectional', polarization: 'Vertical', use: 'Mobile/base VHF-UHF; needs radials/ground.' },
  { name: '5/8λ vertical', gain: '~3 dBd', pattern: 'Omni, low angle', polarization: 'Vertical', use: 'Better DX angle than ¼λ on VHF.' },
  { name: 'J-pole / Slim Jim', gain: '~2–3 dBd', pattern: 'Omnidirectional', polarization: 'Vertical', use: 'Easy end-fed VHF/UHF base antenna.' },
  { name: 'Yagi (3-el)', gain: '~6–7 dBd', pattern: 'Directional beam', polarization: 'Linear', use: 'Point-to-point, weak-signal, contesting.' },
  { name: 'Yagi (long boom)', gain: '10–15+ dBd', pattern: 'Narrow beam', polarization: 'Linear', use: 'EME, satellites, serious DX.' },
  { name: 'Quad / loop', gain: '~7 dBd (2-el)', pattern: 'Directional', polarization: 'Linear', use: 'Quieter RX than Yagi, bigger.' },
  { name: 'End-fed half-wave (EFHW)', gain: '~dipole', pattern: 'Like a dipole', polarization: 'Linear', use: 'Multiband HF with a 49:1 unun; easy to hang.' },
  { name: 'Magnetic loop', gain: 'low (high-Q)', pattern: 'Figure-8, deep nulls', polarization: 'Linear', use: 'Small-space/HOA HF; narrow bandwidth, must retune.' },
  { name: 'Parabolic dish', gain: '20–40+ dBi', pattern: 'Pencil beam', polarization: 'Per feed', use: 'Microwave, satellite; gain rises with size & frequency.' },
  { name: 'Helical (axial)', gain: '~10–15 dBic', pattern: 'Beam', polarization: 'Circular', use: 'Satellite work; matches circularly-polarized downlinks.' },
];
