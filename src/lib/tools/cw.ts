export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.', '=': '-...-', '+': '.-.-.',
};

export function toMorse(text: string): string {
  return Array.from(text.toUpperCase())
    .map((c) => (c === ' ' ? '/' : (MORSE[c] ?? '')))
    .filter(Boolean)
    .join(' ');
}

export const RST_READABILITY = [
  '1 — Unreadable',
  '2 — Barely readable, occasional words',
  '3 — Readable with difficulty',
  '4 — Readable with little difficulty',
  '5 — Perfectly readable',
];
export const RST_STRENGTH = [
  '1 — Faint, barely perceptible',
  '2 — Very weak',
  '3 — Weak',
  '4 — Fair',
  '5 — Fairly good',
  '6 — Good',
  '7 — Moderately strong',
  '8 — Strong',
  '9 — Extremely strong',
];
export const RST_TONE = [
  '1 — Extremely rough hissing note',
  '5 — Musically modulated note',
  '7 — Near-DC note, smooth ripple',
  '9 — Perfect pure tone',
];

export const PROSIGNS: { sign: string; meaning: string }[] = [
  { sign: 'CQ', meaning: 'Calling any station' },
  { sign: 'DE', meaning: 'From (this is)' },
  { sign: 'K', meaning: 'Invitation to transmit (go ahead)' },
  { sign: 'KN', meaning: 'Go ahead, named station only' },
  { sign: 'AR', meaning: 'End of message (+)' },
  { sign: 'SK', meaning: 'End of contact' },
  { sign: 'BK', meaning: 'Break — quick turnover' },
  { sign: 'AS', meaning: 'Wait / stand by' },
  { sign: 'R', meaning: 'Received / roger' },
  { sign: 'BT', meaning: 'Separator (=)' },
  { sign: '73', meaning: 'Best regards' },
  { sign: '88', meaning: 'Love and kisses' },
  { sign: 'QSL', meaning: 'I acknowledge receipt' },
  { sign: 'QRZ', meaning: 'Who is calling me?' },
  { sign: 'QTH', meaning: 'My location is…' },
  { sign: 'ES', meaning: 'And' },
  { sign: 'OM', meaning: 'Old man (any operator)' },
  { sign: 'FB', meaning: 'Fine business (excellent)' },
];
