export interface PropMode {
  name: string;
  bands: string;
  description: string;
  when: string;
}

export const PROP_MODES: PropMode[] = [
  { name: 'Ground wave', bands: 'LF–lower HF', description: 'Signal follows the Earth’s surface.', when: 'Short range, reliable day/night on low bands.' },
  { name: 'F2 skip', bands: 'HF (3–30 MHz)', description: 'Refraction off the F2 ionospheric layer — the workhorse of HF DX.', when: 'Follows the solar cycle; higher bands open with high solar flux.' },
  { name: 'Sporadic-E (Es)', bands: '6m, 10m, occasionally 2m', description: 'Patches of intense ionization in the E layer.', when: 'Mainly late spring/summer; sudden, strong, short openings.' },
  { name: 'Grey-line', bands: 'HF (esp. low bands)', description: 'Enhanced propagation along the sunrise/sunset terminator.', when: 'Around local dawn and dusk.' },
  { name: 'NVIS', bands: '40m, 80m', description: 'Near-vertical incidence skywave — straight up and back down.', when: 'Regional coverage (0–400 km), good for emcomm.' },
  { name: 'Tropospheric ducting', bands: 'VHF/UHF', description: 'Signals trapped in atmospheric temperature inversions.', when: 'High-pressure weather; coastal/overnight; hundreds of km.' },
  { name: 'Meteor scatter', bands: '6m, 2m', description: 'Reflections off ionized meteor trails (use MSK144).', when: 'Best near meteor showers and dawn; bursts of seconds.' },
  { name: 'Aurora', bands: '6m, 2m', description: 'Backscatter off auroral curtains; distorted/raspy audio.', when: 'During geomagnetic storms (high K index); aim north.' },
  { name: 'EME (moonbounce)', bands: 'VHF–microwave', description: 'Earth–Moon–Earth; the Moon as a passive reflector.', when: 'Anytime the Moon is up; needs gain antennas and patience.' },
  { name: 'Trans-equatorial (TEP)', bands: '6m, 10m', description: 'North–south paths across the magnetic equator.', when: 'Afternoon/evening near equinoxes.' },
];
