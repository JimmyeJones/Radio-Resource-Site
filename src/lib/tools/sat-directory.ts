export const SAT_MODE_NOTATION: { code: string; meaning: string }[] = [
  { code: 'U/V', meaning: 'Uplink 70cm (UHF), downlink 2m (VHF) — "Mode B"' },
  { code: 'V/U', meaning: 'Uplink 2m (VHF), downlink 70cm (UHF) — "Mode J"' },
  { code: 'U/U', meaning: 'Uplink and downlink both on 70cm' },
  { code: 'V/V', meaning: 'Uplink and downlink both on 2m' },
  { code: 'L/S', meaning: 'Uplink 23cm (L), downlink 13cm (S)' },
  { code: 'S/X', meaning: 'Uplink 13cm (S), downlink 3cm (X) — e.g. QO-100 NB' },
];

export interface SatDirEntry {
  name: string;
  type: string;
  mode: string;
  uplink: string;
  downlink: string;
  note: string;
}

export const SAT_DIRECTORY: SatDirEntry[] = [
  { name: 'ISS (voice)', type: 'Crewed FM', mode: 'V/V', uplink: '144.490', downlink: '145.800', note: 'Occasional crew voice / school contacts.' },
  { name: 'ISS (APRS)', type: 'Digipeater', mode: 'V/V', uplink: '145.825', downlink: '145.825', note: 'Packet digipeater, 1k2 AFSK.' },
  { name: 'ISS (SSTV)', type: 'Image', mode: '—', uplink: '—', downlink: '145.800', note: 'Periodic SSTV events (PD120).' },
  { name: 'SO-50', type: 'FM repeater', mode: 'V/U', uplink: '145.850', downlink: '436.795', note: '67 Hz tone to access; 74.4 Hz arms the 10-min timer.' },
  { name: 'AO-91', type: 'FM repeater', mode: 'U/V', uplink: '435.250', downlink: '145.960', note: '67 Hz CTCSS uplink.' },
  { name: 'AO-92', type: 'FM repeater', mode: 'U/V', uplink: '435.350', downlink: '145.880', note: '67 Hz CTCSS uplink.' },
  { name: 'RS-44', type: 'Linear (inverting)', mode: 'V/U', uplink: '145.935–145.995', downlink: '435.610–435.670', note: 'SSB/CW; gentle, long passes.' },
  { name: 'AO-7', type: 'Linear', mode: 'U/V or V/U', uplink: '432.125–432.175', downlink: '145.975–145.925', note: 'Oldest working sat; mode switches with sunlight.' },
  { name: 'AO-73 (FUNcube-1)', type: 'Linear + telemetry', mode: 'U/V', uplink: '435.130–435.150', downlink: '145.950–145.970', note: 'Transponder at night, telemetry by day.' },
  { name: 'QO-100 (NB)', type: 'Geostationary linear', mode: 'S/X', uplink: '2400.050–2400.300', downlink: '10489.550–10489.800', note: 'Visible from EU/Africa/ME; needs a dish.' },
  { name: 'NOAA-15/18/19', type: 'Weather (APT)', mode: '—', uplink: '—', downlink: '137.620 / 137.9125 / 137.100', note: 'Analog APT imagery.' },
  { name: 'METEOR-M2', type: 'Weather (LRPT)', mode: '—', uplink: '—', downlink: '137.100', note: 'Digital QPSK imagery.' },
];

export interface SatResource {
  title: string;
  url: string;
  note: string;
}

export const SAT_RESOURCES: SatResource[] = [
  { title: 'AMSAT status & news', url: 'https://www.amsat.org', note: 'Real-time satellite status reports and keps.' },
  { title: 'SatNOGS', url: 'https://satnogs.org', note: 'Open ground-station network with recordings.' },
  { title: 'n2yo live tracking', url: 'https://www.n2yo.com', note: 'Real-time tracking and pass predictions.' },
  { title: 'JE9PEL frequency list', url: 'http://www.ne.jp/asahi/hamradio/je9pel/satslist.htm', note: 'Comprehensive amateur satellite frequency database.' },
  { title: 'Gpredict', url: 'http://gpredict.oz9aec.net/', note: 'Desktop tracking + Doppler/rotator control.' },
  { title: 'SatDump', url: 'https://www.satdump.org/', note: 'Decode weather/LEO satellite downlinks.' },
];
