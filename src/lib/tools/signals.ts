export interface SignalEntry {
  name: string;
  freq: string; // human range
  mode: string;
  bandwidth: string;
  description: string;
  band: 'HF' | 'VHF' | 'UHF' | 'SHF' | 'Multi';
}

// A starter catalog of commonly-encountered signals to help identify what you're
// hearing/seeing on a waterfall. Frequencies are typical, not exhaustive.
export const SIGNALS: SignalEntry[] = [
  { name: 'NOAA APT', freq: '137.10 / 137.62 / 137.9125 MHz', mode: 'APT (FM)', bandwidth: '~34 kHz', band: 'VHF', description: 'Analog weather imagery from NOAA POES satellites. Steady warbling tone; decode to images with WXtoImg/SatDump.' },
  { name: 'Meteor-M LRPT', freq: '137.10 / 137.90 MHz', mode: 'LRPT (QPSK)', bandwidth: '~120 kHz', band: 'VHF', description: 'Digital weather imagery from Russian Meteor-M satellites. Decode with SatDump.' },
  { name: 'ADS-B', freq: '1090 MHz', mode: 'PPM', bandwidth: '~2 MHz', band: 'UHF', description: 'Aircraft position/identity broadcasts. Decode with dump1090.' },
  { name: 'AIS', freq: '161.975 / 162.025 MHz', mode: 'GMSK', bandwidth: '~25 kHz', band: 'VHF', description: 'Ship position reports. Decode with AISdecoder/gr-ais.' },
  { name: 'POCSAG / FLEX', freq: '138–466 MHz (region-dependent)', mode: 'FSK', bandwidth: '~12.5 kHz', band: 'Multi', description: 'Pager networks. Decode with multimon-ng.' },
  { name: 'FT8', freq: 'HF band segments (e.g. 14.074 MHz)', mode: '8-FSK', bandwidth: '~50 Hz/signal', band: 'HF', description: 'Weak-signal digital mode; 15 s slots, many signals in a 2.5 kHz window. Decode with WSJT-X.' },
  { name: 'WSPR', freq: 'e.g. 14.0956 MHz', mode: '4-FSK', bandwidth: '~6 Hz', band: 'HF', description: 'Very weak-signal propagation beacons.' },
  { name: 'RTTY', freq: 'HF (e.g. 14.080 MHz)', mode: 'FSK', bandwidth: '~250–450 Hz', band: 'HF', description: 'Radioteletype; two-tone diddle. 45.45 baud / 170 Hz shift typical.' },
  { name: 'PSK31', freq: 'HF (e.g. 14.070 MHz)', mode: 'BPSK', bandwidth: '~31 Hz', band: 'HF', description: 'Keyboard-to-keyboard chat mode; narrow warble.' },
  { name: 'DMR', freq: 'VHF/UHF', mode: '4FSK TDMA', bandwidth: '12.5 kHz', band: 'Multi', description: 'Digital voice (two timeslots). Decode with DSD/SDRTrunk.' },
  { name: 'D-STAR', freq: 'VHF/UHF', mode: 'GMSK', bandwidth: '6.25 kHz', band: 'Multi', description: 'Amateur digital voice + data.' },
  { name: 'APRS', freq: '144.39 (NA) / 144.80 (EU) MHz', mode: 'AFSK 1k2', bandwidth: '~15 kHz', band: 'VHF', description: 'Packet position/telemetry. Decode with direwolf.' },
  { name: 'ACARS', freq: '~131 MHz', mode: 'AM MSK', bandwidth: '~2.4 kHz', band: 'VHF', description: 'Aircraft text/data link. Decode with acarsdec.' },
  { name: 'HFDL', freq: 'HF (multiple)', mode: 'PSK', bandwidth: '~2.6 kHz', band: 'HF', description: 'High-frequency aircraft data link.' },
  { name: 'STANAG 4285', freq: 'HF', mode: 'PSK', bandwidth: '~2.4 kHz', band: 'HF', description: 'Military/marine serial modem; steady idle pattern.' },
  { name: 'DAB / DAB+', freq: 'Band III (~174–240 MHz)', mode: 'OFDM', bandwidth: '~1.5 MHz', band: 'VHF', description: 'Digital audio broadcasting multiplex.' },
];
