// Solar geometry for the day/night terminator (grey line). Pure math, no deps.
// Accuracy is good to a fraction of a degree — plenty for a world map.

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

export interface SubSolar {
  lat: number; // subsolar latitude (= solar declination), degrees
  lon: number; // subsolar longitude, degrees (−180..180)
}

/** Julian centuries since the J2000.0 epoch (2000-01-01 12:00 UTC). */
function julianCenturies(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - 2451545.0) / 36525;
}

/**
 * Subsolar point: the latitude/longitude where the Sun is directly overhead.
 * Uses a low-precision solar position model (NOAA-style).
 */
export function subsolarPoint(date: Date = new Date()): SubSolar {
  const t = julianCenturies(date);

  // Geometric mean longitude & anomaly of the Sun (degrees).
  const L0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const Mrad = M * RAD;

  // Equation of center.
  const C =
    Math.sin(Mrad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * Mrad) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * Mrad) * 0.000289;
  const trueLong = L0 + C;

  // Obliquity of the ecliptic.
  const eps = 23.439291 - 0.0130042 * t;
  const lambda = trueLong * RAD;

  // Solar declination.
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda)) * DEG;

  // Equation of time (minutes).
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const L0rad = L0 * RAD;
  const eccent = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const eqTime =
    4 *
    DEG *
    (y * Math.sin(2 * L0rad) -
      2 * eccent * Math.sin(Mrad) +
      4 * eccent * y * Math.sin(Mrad) * Math.cos(2 * L0rad) -
      0.5 * y * y * Math.sin(4 * L0rad) -
      1.25 * eccent * eccent * Math.sin(2 * Mrad));

  // UTC fractional hours.
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Subsolar longitude: noon is at the meridian where local apparent solar time = 12.
  let lon = -15 * (utcHours - 12 + eqTime / 60);
  // Normalize to −180..180.
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;

  return { lat: decl, lon };
}

/** Solar elevation angle (degrees) at a point, given the subsolar point. */
export function solarElevation(lat: number, lon: number, sub: SubSolar): number {
  const φ = lat * RAD;
  const δ = sub.lat * RAD;
  const H = (lon - sub.lon) * RAD;
  const sinEl = Math.sin(φ) * Math.sin(δ) + Math.cos(φ) * Math.cos(δ) * Math.cos(H);
  return Math.asin(Math.max(-1, Math.min(1, sinEl))) * DEG;
}

export function isDaylight(lat: number, lon: number, sub: SubSolar): boolean {
  return solarElevation(lat, lon, sub) > 0;
}

/**
 * For a given longitude, the latitude of the terminator (where the Sun is on
 * the horizon). Returns the night-side boundary latitude.
 */
export function terminatorLatitude(lon: number, sub: SubSolar): number {
  const δ = sub.lat * RAD;
  const H = (lon - sub.lon) * RAD;
  // 0 = sinφ sinδ + cosφ cosδ cosH  ⇒  tanφ = −cosH / tanδ
  if (Math.abs(δ) < 1e-6) return 0;
  const lat = Math.atan(-Math.cos(H) / Math.tan(δ)) * DEG;
  return lat;
}
