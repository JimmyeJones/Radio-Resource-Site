// Minimal ADIF (Amateur Data Interchange Format) reader/writer.

export interface AdifRecord {
  call?: string;
  qso_date?: string; // YYYYMMDD
  time_on?: string; // HHMM(SS)
  band?: string;
  mode?: string;
  freq?: string; // MHz
  rst_sent?: string;
  rst_rcvd?: string;
  name?: string;
  qth?: string;
  gridsquare?: string;
  country?: string;
  sat_name?: string;
  comment?: string;
  [k: string]: string | undefined;
}

/** Parse ADIF text into records. Tolerant of the common subset. */
export function parseAdif(text: string): AdifRecord[] {
  // Skip the header (everything before <EOH>) if present.
  const eoh = text.toUpperCase().indexOf('<EOH>');
  const body = eoh >= 0 ? text.slice(eoh + 5) : text;

  const records: AdifRecord[] = [];
  let current: AdifRecord = {};
  const re = /<([A-Za-z0-9_]+)(?::(\d+))?(?::[A-Za-z])?>/g;
  let m: RegExpExecArray | null;
  let lastIndex = 0;

  while ((m = re.exec(body)) !== null) {
    const field = m[1].toLowerCase();
    const len = m[2] ? Number(m[2]) : 0;
    const valStart = re.lastIndex;
    if (field === 'eor') {
      if (Object.keys(current).length) records.push(current);
      current = {};
      lastIndex = re.lastIndex;
      continue;
    }
    if (field === 'eoh') {
      lastIndex = re.lastIndex;
      continue;
    }
    const value = body.substr(valStart, len);
    current[field] = value;
    re.lastIndex = valStart + len;
    lastIndex = re.lastIndex;
  }
  void lastIndex;
  if (Object.keys(current).length) records.push(current);
  return records;
}

function field(name: string, value: string | null | undefined): string {
  if (value == null || value === '') return '';
  return `<${name.toUpperCase()}:${value.length}>${value}`;
}

export interface QsoLike {
  callsign: string;
  qsoAt: number;
  band?: string | null;
  mode?: string | null;
  freqMhz?: number | null;
  rstSent?: string | null;
  rstRcvd?: string | null;
  name?: string | null;
  qth?: string | null;
  grid?: string | null;
  country?: string | null;
  satellite?: string | null;
  notes?: string | null;
}

export function toAdif(qsos: QsoLike[]): string {
  const lines = ['Radio Resource Site ADIF export', `<ADIF_VER:5>3.1.4`, `<PROGRAMID:19>RadioResourceSite`, '<EOH>'];
  for (const q of qsos) {
    const d = new Date(q.qsoAt * 1000);
    const z = (n: number, w = 2) => String(n).padStart(w, '0');
    const date = `${d.getUTCFullYear()}${z(d.getUTCMonth() + 1)}${z(d.getUTCDate())}`;
    const time = `${z(d.getUTCHours())}${z(d.getUTCMinutes())}${z(d.getUTCSeconds())}`;
    lines.push(
      [
        field('CALL', q.callsign),
        field('QSO_DATE', date),
        field('TIME_ON', time),
        field('BAND', q.band),
        field('MODE', q.mode),
        q.freqMhz != null ? field('FREQ', String(q.freqMhz)) : '',
        field('RST_SENT', q.rstSent),
        field('RST_RCVD', q.rstRcvd),
        field('NAME', q.name),
        field('QTH', q.qth),
        field('GRIDSQUARE', q.grid),
        field('COUNTRY', q.country),
        field('SAT_NAME', q.satellite),
        field('COMMENT', q.notes),
        '<EOR>',
      ]
        .filter(Boolean)
        .join(' '),
    );
  }
  return lines.join('\n');
}

/** Convert an ADIF date(YYYYMMDD)+time(HHMM[SS]) to a unix timestamp (UTC). */
export function adifDateToUnix(date?: string, time?: string): number {
  if (!date || date.length < 8) return Math.floor(Date.now() / 1000);
  const y = Number(date.slice(0, 4));
  const mo = Number(date.slice(4, 6)) - 1;
  const d = Number(date.slice(6, 8));
  const t = time ?? '0000';
  const h = Number(t.slice(0, 2) || '0');
  const mi = Number(t.slice(2, 4) || '0');
  const s = Number(t.slice(4, 6) || '0');
  return Math.floor(Date.UTC(y, mo, d, h, mi, s) / 1000);
}
