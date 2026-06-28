export interface RawTle {
  name: string;
  line1: string;
  line2: string;
  satId: number;
}

const NORAD_RE = /^(?:1\s)(\d{1,5})/;

export function parseTleBlock(text: string): RawTle[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const sats: RawTle[] = [];
  for (let i = 0; i + 2 < lines.length; i++) {
    if (lines[i + 1].startsWith('1 ') && lines[i + 2].startsWith('2 ')) {
      const m = lines[i + 1].match(NORAD_RE);
      if (!m) continue;
      sats.push({
        name: lines[i].replace(/\s+$/, ''),
        line1: lines[i + 1],
        line2: lines[i + 2],
        satId: Number(m[1]),
      });
      i += 2;
    }
  }
  return sats;
}
