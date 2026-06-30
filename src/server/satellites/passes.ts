import * as sat from 'satellite.js';

export interface Observer {
  lat: number; // degrees
  lon: number; // degrees
  elevationM?: number;
}

export interface TleInput {
  name: string;
  norad: number;
  line1: string;
  line2: string;
}

export interface SatPass {
  satellite: string;
  norad: number;
  aos: number; // unix seconds
  los: number;
  maxElevationDeg: number;
  maxElevationAt: number;
  durationS: number;
  startAzimuthDeg: number;
  endAzimuthDeg: number;
}

const TAU = Math.PI * 2;
function radToDeg(r: number) { return (r * 180) / Math.PI; }
function degToRad(d: number) { return (d * Math.PI) / 180; }

/**
 * Compute satellite passes over the given observer over the next `hours`.
 * Uses 30-second sampling; refines AOS/LOS by linear interpolation.
 */
export function predictPasses(
  tle: TleInput,
  observer: Observer,
  hours = 48,
  startTime: Date = new Date(),
): SatPass[] {
  const satrec = sat.twoline2satrec(tle.line1, tle.line2);
  if (!satrec || satrec.error) return [];

  const obs = {
    longitude: degToRad(observer.lon),
    latitude: degToRad(observer.lat),
    height: (observer.elevationM ?? 0) / 1000,
  };

  const samples: { t: number; elev: number; az: number }[] = [];
  const stepMs = 30 * 1000;
  const endMs = startTime.getTime() + hours * 3600 * 1000;
  for (let t = startTime.getTime(); t < endMs; t += stepMs) {
    const d = new Date(t);
    const pv = sat.propagate(satrec, d);
    if (!pv.position || typeof pv.position === 'boolean') continue;
    const gmst = sat.gstime(d);
    const ecf = sat.eciToEcf(pv.position, gmst);
    const look = sat.ecfToLookAngles(obs, ecf);
    samples.push({ t, elev: radToDeg(look.elevation), az: (radToDeg(look.azimuth) + 360) % 360 });
  }

  const passes: SatPass[] = [];
  let inPass = false;
  let startIdx = 0;
  for (let i = 1; i < samples.length; i++) {
    const above = samples[i].elev > 0;
    if (!inPass && above) {
      inPass = true;
      startIdx = i - 1;
    } else if (inPass && !above) {
      const start = interpZero(samples[startIdx], samples[startIdx + 1]);
      const end = interpZero(samples[i - 1], samples[i]);
      let maxIdx = startIdx;
      for (let k = startIdx + 1; k <= i; k++) if (samples[k].elev > samples[maxIdx].elev) maxIdx = k;
      passes.push({
        satellite: tle.name,
        norad: tle.norad,
        aos: Math.floor(start.t / 1000),
        los: Math.floor(end.t / 1000),
        maxElevationDeg: samples[maxIdx].elev,
        maxElevationAt: Math.floor(samples[maxIdx].t / 1000),
        durationS: Math.round((end.t - start.t) / 1000),
        startAzimuthDeg: samples[startIdx + 1].az,
        endAzimuthDeg: samples[i].az,
      });
      inPass = false;
    }
  }
  return passes;
}

function interpZero(a: { t: number; elev: number }, b: { t: number; elev: number }) {
  if (a.elev === b.elev) return { t: a.t };
  const f = -a.elev / (b.elev - a.elev);
  return { t: a.t + f * (b.t - a.t) };
}

export function azimuthCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function buildIcs(passes: SatPass[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Radio Resource Site//Satellites//EN',
    'CALSCALE:GREGORIAN',
  ];
  for (const p of passes) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${p.norad}-${p.aos}@radio-resource`,
      `DTSTAMP:${ics(p.aos)}`,
      `DTSTART:${ics(p.aos)}`,
      `DTEND:${ics(p.los)}`,
      `SUMMARY:${escapeIcsText(`${p.satellite} pass · max ${p.maxElevationDeg.toFixed(0)}°`)}`,
      `DESCRIPTION:${escapeIcsText(`AOS ${azimuthCompass(p.startAzimuthDeg)} · LOS ${azimuthCompass(p.endAzimuthDeg)} · ${p.durationS}s`)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Escape a string for use as an iCalendar TEXT value (RFC 5545 §3.3.11):
// backslash, comma, and semicolon are escaped; newlines become "\n".
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

function ics(unix: number): string {
  const d = new Date(unix * 1000);
  const z = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${d.getUTCFullYear()}${z(d.getUTCMonth() + 1)}${z(d.getUTCDate())}T${z(d.getUTCHours())}${z(d.getUTCMinutes())}${z(d.getUTCSeconds())}Z`;
}
