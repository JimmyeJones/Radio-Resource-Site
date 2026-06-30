export interface TimeStation {
  call: string;
  location: string;
  freqs: string;
  note: string;
}

export const TIME_STATIONS: TimeStation[] = [
  { call: 'WWV', location: 'Fort Collins, Colorado, USA', freqs: '2.5, 5, 10, 15, 20 MHz', note: 'Voice time announcements, standard tones.' },
  { call: 'WWVH', location: 'Kauai, Hawaii, USA', freqs: '2.5, 5, 10, 15 MHz', note: 'Female voice (vs WWV male) to distinguish.' },
  { call: 'WWVB', location: 'Fort Collins, Colorado, USA', freqs: '60 kHz', note: 'LF time-code that sets "atomic" clocks in North America.' },
  { call: 'CHU', location: 'Ottawa, Canada', freqs: '3.330, 7.850, 14.670 MHz', note: 'English/French; digital time code in the audio.' },
  { call: 'DCF77', location: 'Mainflingen, Germany', freqs: '77.5 kHz', note: 'Sets radio clocks across Europe.' },
  { call: 'MSF', location: 'Anthorn, UK', freqs: '60 kHz', note: 'UK time-code station.' },
  { call: 'JJY', location: 'Japan', freqs: '40 & 60 kHz', note: 'Two transmitters serving Japan.' },
  { call: 'RWM', location: 'Moscow, Russia', freqs: '4.996, 9.996, 14.996 MHz', note: 'Standard frequency/time, CW format.' },
];
