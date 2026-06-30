export type Topic =
  | 'satellite'
  | 'sdr'
  | 'antenna'
  | 'feed'
  | 'pcb'
  | 'electronics'
  | 'ham'
  | 'radio-astronomy'
  | 'weather-sat'
  | 'off-topic';

export const TOPIC_LABELS: Record<string, string> = {
  satellite: 'Satellite',
  sdr: 'SDR',
  antenna: 'Antenna',
  feed: 'Feed/Dish',
  pcb: 'PCB',
  electronics: 'Electronics',
  ham: 'Ham Radio',
  'radio-astronomy': 'Radio Astronomy',
  'weather-sat': 'Weather Sat',
  'off-topic': 'Off-topic',
  uncategorized: 'Uncategorized',
};

// Ordered most-specific first; a match adds the topic. Keywords are matched
// case-insensitively against title + description + channel.
const RULES: { topic: Topic; keywords: string[] }[] = [
  {
    topic: 'weather-sat',
    keywords: ['noaa', 'meteor-m', 'apt ', 'lrpt', 'goes ', 'weather satellite', 'wxtoimg'],
  },
  {
    topic: 'satellite',
    keywords: [
      'satellite', 'satcom', 'cubesat', 'iss ', 'amsat', 'leo ', 'geostationary',
      'inmarsat', 'iridium', 'starlink', 'tle', 'orbit', 'downlink', 'transponder',
      'so-50', 'ao-91', 'rs-44', 'doppler',
    ],
  },
  {
    topic: 'feed',
    keywords: [
      'feed horn', 'feedhorn', 'dish', 'parabolic', 'waveguide', 'lnb', 'offset dish',
      'septum', 'helical feed', 'cantenna', 'horn antenna',
    ],
  },
  {
    topic: 'antenna',
    keywords: [
      'antenna', 'dipole', 'yagi', 'vertical', 'j-pole', 'jpole', 'ground plane',
      'vswr', 'swr', 'balun', 'unun', 'loop antenna', 'end fed', 'endfed', 'efhw',
      'discone', 'log periodic', 'quad ', 'moxon',
    ],
  },
  {
    topic: 'sdr',
    keywords: [
      'sdr', 'rtl-sdr', 'rtlsdr', 'hackrf', 'airspy', 'sdrplay', 'gqrx', 'sdr++',
      'sdrangel', 'gnu radio', 'gnuradio', 'software defined', 'dsp', 'fft', 'waterfall',
    ],
  },
  {
    topic: 'pcb',
    keywords: [
      'pcb', 'kicad', 'eagle cad', 'altium', 'gerber', 'jlcpcb', 'pcbway', 'soldermask',
      'footprint', 'schematic', 'trace width', 'impedance control', 'via stitching',
      'reflow', 'smd ', 'surface mount', 'two layer', 'four layer', '4-layer',
    ],
  },
  {
    topic: 'electronics',
    keywords: [
      'oscilloscope', 'multimeter', 'soldering', 'breadboard', 'microcontroller',
      'arduino', 'esp32', 'stm32', 'raspberry pi', 'op-amp', 'opamp', 'mosfet',
      'voltage regulator', 'power supply', 'teardown', 'repair', 'circuit',
    ],
  },
  {
    topic: 'radio-astronomy',
    keywords: [
      'radio astronomy', 'radio telescope', 'hydrogen line', '21cm', '21 cm', 'pulsar',
      'jupiter noise', 'meteor scatter', 'horn telescope', 'lna ', 'galactic',
    ],
  },
  {
    topic: 'ham',
    keywords: [
      'ham radio', 'amateur radio', 'hf ', 'vhf', 'uhf', 'qso', 'pota', 'sota',
      'field day', 'morse', 'cw ', 'ssb', 'ft8', 'repeater', 'baofeng', 'transceiver',
      'callsign', 'dx ', 'contest', 'band plan', 'license exam', '73 ',
    ],
  },
];

/**
 * Classify a video into zero or more topics by keyword matching. Returns
 * ['uncategorized'] when nothing matches so the UI always has something to
 * group by; the caller may treat that as "needs manual tagging".
 */
export function classify(
  title: string | null | undefined,
  description?: string | null,
  channel?: string | null,
): string[] {
  const hay = `${title ?? ''} ${description ?? ''} ${channel ?? ''}`.toLowerCase();
  const hits = new Set<string>();
  for (const { topic, keywords } of RULES) {
    if (keywords.some((k) => hay.includes(k))) hits.add(topic);
  }
  // Collapse feed → also implies antenna/satellite context but keep distinct.
  return hits.size > 0 ? Array.from(hits) : ['uncategorized'];
}

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
