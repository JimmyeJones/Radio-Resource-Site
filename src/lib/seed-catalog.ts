import type { HubItem } from '@/db/schema';

export interface SeedChannel {
  name: string;
  url: string;
  note: string;
  topics: string[];
}

export interface SeedLink {
  title: string;
  url: string;
  kind: HubItem['kind'];
  note: string;
  tags: string[];
}

export interface SeedCategory {
  id: string;
  label: string;
  blurb: string;
  channels: SeedChannel[];
  links: SeedLink[];
}

// Curated starting suggestions. The user toggles which to add during setup;
// channel handles are resolved to UC… IDs at subscribe time via yt-dlp.
export const SEED_CATALOG: SeedCategory[] = [
  {
    id: 'satellite',
    label: 'Satellites, SDR & dishes',
    blurb: 'Reception, decoding, and dish/feed building.',
    channels: [
      { name: 'dereksgc', url: 'https://www.youtube.com/@dereksgc', note: 'Satellite reception and custom feed/dish builds.', topics: ['satellite', 'feed', 'antenna', 'sdr'] },
      { name: 'saveitforparts', url: 'https://www.youtube.com/@saveitforparts', note: 'Surplus dishes, satellite hacking, off-grid reception.', topics: ['satellite', 'antenna'] },
      { name: 'Tech Minds', url: 'https://www.youtube.com/@TechMindsOfficial', note: 'SDR projects and satellite decoding walkthroughs.', topics: ['sdr', 'satellite'] },
      { name: 'FesZ Electronics', url: 'https://www.youtube.com/@FesZElectronics', note: 'SDR, DSP, and RF deep-dives.', topics: ['sdr', 'electronics'] },
    ],
    links: [
      { title: 'AMSAT', url: 'https://www.amsat.org', kind: 'reference', note: 'Amateur satellite org — status, frequencies, keps.', tags: ['satellite'] },
      { title: 'SatNOGS', url: 'https://satnogs.org', kind: 'reference', note: 'Open global satellite ground-station network.', tags: ['satellite', 'sdr'] },
      { title: 'n2yo live tracking', url: 'https://www.n2yo.com', kind: 'tool', note: 'Real-time satellite tracking and passes.', tags: ['satellite'] },
    ],
  },
  {
    id: 'ham',
    label: 'Ham radio & antennas',
    blurb: 'Operating, antennas, and getting licensed.',
    channels: [
      { name: 'Ham Radio Crash Course', url: 'https://www.youtube.com/@HamRadioCrashCourse', note: 'Beginner-friendly gear reviews and how-tos.', topics: ['ham'] },
      { name: 'K6UDA Radio', url: 'https://www.youtube.com/@K6UDARadio', note: 'Operating, antennas, and gear.', topics: ['ham', 'antenna'] },
      { name: 'KB9VBR Antennas', url: 'https://www.youtube.com/@KB9VBRJPoleAntennas', note: 'Antenna theory and builds.', topics: ['antenna', 'ham'] },
      { name: 'DX Commander', url: 'https://www.youtube.com/@Callsign_DXCommander', note: 'Vertical antenna design and HF operating.', topics: ['antenna', 'ham'] },
      { name: 'W2AEW', url: 'https://www.youtube.com/@w2aew', note: 'Test gear and RF measurement masterclasses.', topics: ['ham', 'electronics'] },
    ],
    links: [
      { title: 'ARRL', url: 'https://www.arrl.org', kind: 'reference', note: 'US national amateur radio association.', tags: ['ham'] },
      { title: 'QRZ callsign lookup', url: 'https://www.qrz.com', kind: 'tool', note: 'Callsign database and logging.', tags: ['ham'] },
    ],
  },
  {
    id: 'pcb',
    label: 'PCB design & electronics',
    blurb: 'Hardware design, layout, and fabrication.',
    channels: [
      { name: "Phil's Lab", url: 'https://www.youtube.com/@PhilsLab', note: 'Professional PCB design, hardware, and DSP.', topics: ['pcb', 'electronics'] },
      { name: 'Robert Feranec', url: 'https://www.youtube.com/@robertferanec', note: 'High-speed PCB and signal integrity.', topics: ['pcb', 'electronics'] },
      { name: 'EEVblog', url: 'https://www.youtube.com/@EEVblog', note: 'Electronics teardowns, reviews, and fundamentals.', topics: ['electronics'] },
      { name: 'Contextual Electronics', url: 'https://www.youtube.com/@Contextualelectronics', note: 'End-to-end KiCad hardware projects.', topics: ['pcb', 'electronics'] },
    ],
    links: [
      { title: 'KiCad EDA', url: 'https://www.kicad.org', kind: 'tool', note: 'Free, open-source PCB design suite.', tags: ['pcb'] },
      { title: 'JLCPCB', url: 'https://jlcpcb.com', kind: 'reference', note: 'Low-cost PCB fab and assembly.', tags: ['pcb'] },
      { title: 'PCBWay', url: 'https://www.pcbway.com', kind: 'reference', note: 'PCB fab, assembly, and prototyping.', tags: ['pcb'] },
      { title: 'SaturnPCB Toolkit', url: 'https://saturnpcb.com/saturn-pcb-toolkit/', kind: 'tool', note: 'Free PCB design calculators.', tags: ['pcb'] },
      { title: 'Octopart', url: 'https://octopart.com', kind: 'tool', note: 'Component search and datasheet finder.', tags: ['pcb', 'electronics'] },
    ],
  },
  {
    id: 'rf',
    label: 'RF & microwave reference',
    blurb: 'Reference material for RF, microwave, and feeds.',
    channels: [],
    links: [
      { title: 'Microwaves101', url: 'https://www.microwaves101.com', kind: 'reference', note: 'Encyclopedic RF/microwave engineering reference.', tags: ['rf', 'feed', 'antenna'] },
      { title: 'everything RF', url: 'https://www.everythingrf.com', kind: 'reference', note: 'RF component search and calculators.', tags: ['rf'] },
      { title: 'SARA (radio astronomy)', url: 'https://www.radio-astronomy.org', kind: 'reference', note: 'Society of Amateur Radio Astronomers.', tags: ['radio-astronomy'] },
    ],
  },
];
