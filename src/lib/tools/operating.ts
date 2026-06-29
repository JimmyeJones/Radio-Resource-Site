// Common amateur operating frequencies. US/IARU-R2 oriented; verify locally.

export interface OperatingFreq {
  band: string;
  freqMHz: string;
  mode: string;
  purpose: string;
}

export const OPERATING_FREQS: OperatingFreq[] = [
  // Calling frequencies
  { band: '160m', freqMHz: '1.910', mode: 'SSB', purpose: 'SSB calling' },
  { band: '80m', freqMHz: '3.985', mode: 'SSB', purpose: 'SSB calling (phone)' },
  { band: '40m', freqMHz: '7.285', mode: 'SSB', purpose: 'SSB calling' },
  { band: '40m', freqMHz: '7.030', mode: 'CW', purpose: 'QRP CW calling' },
  { band: '20m', freqMHz: '14.285', mode: 'SSB', purpose: 'SSB calling' },
  { band: '20m', freqMHz: '14.060', mode: 'CW', purpose: 'QRP CW calling' },
  { band: '20m', freqMHz: '14.070', mode: 'PSK31', purpose: 'PSK31 activity' },
  { band: '20m', freqMHz: '14.074', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '20m', freqMHz: '14.080', mode: 'RTTY', purpose: 'RTTY activity' },
  { band: '20m', freqMHz: '14.230', mode: 'SSTV', purpose: 'SSTV' },
  { band: '20m', freqMHz: '14.0956', mode: 'WSPR', purpose: 'WSPR beacon' },
  { band: '17m', freqMHz: '18.100', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '15m', freqMHz: '21.285', mode: 'SSB', purpose: 'SSB calling' },
  { band: '15m', freqMHz: '21.074', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '10m', freqMHz: '28.400', mode: 'SSB', purpose: 'SSB calling' },
  { band: '10m', freqMHz: '28.074', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '10m', freqMHz: '28.680', mode: 'SSTV', purpose: 'SSTV' },
  // VHF/UHF
  { band: '6m', freqMHz: '50.125', mode: 'SSB', purpose: 'SSB calling' },
  { band: '6m', freqMHz: '50.313', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '6m', freqMHz: '52.525', mode: 'FM', purpose: 'FM simplex calling' },
  { band: '2m', freqMHz: '144.200', mode: 'SSB', purpose: 'SSB calling (USB)' },
  { band: '2m', freqMHz: '144.174', mode: 'FT8', purpose: 'FT8 dial' },
  { band: '2m', freqMHz: '146.520', mode: 'FM', purpose: 'FM national simplex calling' },
  { band: '1.25m', freqMHz: '223.500', mode: 'FM', purpose: 'FM simplex calling' },
  { band: '70cm', freqMHz: '432.100', mode: 'SSB', purpose: 'SSB/CW calling' },
  { band: '70cm', freqMHz: '446.000', mode: 'FM', purpose: 'FM simplex calling' },
  { band: '23cm', freqMHz: '1296.100', mode: 'SSB', purpose: 'SSB/CW calling' },
];
