export interface QCode {
  code: string;
  question: string;
  statement: string;
  notes?: string;
}

export const Q_CODES: QCode[] = [
  { code: 'QRA', question: 'What is the name of your station?', statement: 'The name of my station is …' },
  { code: 'QRG', question: 'Will you tell me my exact frequency?', statement: 'Your exact frequency is …' },
  { code: 'QRH', question: 'Does my frequency vary?', statement: 'Your frequency varies.' },
  { code: 'QRI', question: 'How is the tone of my transmission?', statement: 'The tone of your transmission is …' },
  { code: 'QRK', question: 'What is the intelligibility of my signals?', statement: 'The intelligibility of your signals is … (1–5).' },
  { code: 'QRL', question: 'Are you busy?', statement: 'I am busy. Please do not interfere.' },
  { code: 'QRM', question: 'Is my transmission being interfered with?', statement: 'Your transmission is being interfered with (man-made).' },
  { code: 'QRN', question: 'Are you troubled by static?', statement: 'I am troubled by static (natural).' },
  { code: 'QRO', question: 'Shall I increase power?', statement: 'Increase power.' },
  { code: 'QRP', question: 'Shall I decrease power?', statement: 'Decrease power.', notes: 'Also: low-power operation (typically ≤ 5W CW / 10W SSB).' },
  { code: 'QRQ', question: 'Shall I send faster?', statement: 'Send faster (… WPM).' },
  { code: 'QRS', question: 'Shall I send more slowly?', statement: 'Send more slowly (… WPM).' },
  { code: 'QRT', question: 'Shall I stop sending?', statement: 'Stop sending / I am closing down.' },
  { code: 'QRU', question: 'Have you anything for me?', statement: 'I have nothing for you.' },
  { code: 'QRV', question: 'Are you ready?', statement: 'I am ready.' },
  { code: 'QRX', question: 'When will you call me again?', statement: 'I will call you again at …' },
  { code: 'QRZ', question: 'Who is calling me?', statement: 'You are being called by …' },
  { code: 'QSA', question: 'What is the strength of my signals?', statement: 'The strength of your signals is … (1–5).' },
  { code: 'QSB', question: 'Are my signals fading?', statement: 'Your signals are fading.' },
  { code: 'QSL', question: 'Can you acknowledge receipt?', statement: 'I acknowledge receipt.' },
  { code: 'QSO', question: 'Can you communicate with … directly?', statement: 'I can communicate with … directly.', notes: 'Also: a two-way contact.' },
  { code: 'QSP', question: 'Will you relay a message to …?', statement: 'I will relay a message to …' },
  { code: 'QST', question: '—', statement: 'General call preceding a message addressed to all amateurs.' },
  { code: 'QSY', question: 'Shall I change frequency?', statement: 'Change to transmission on another frequency.' },
  { code: 'QTH', question: 'What is your location?', statement: 'My location is …' },
  { code: 'QTR', question: 'What is the correct time?', statement: 'The correct time is …' },
];
