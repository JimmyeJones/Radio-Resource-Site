'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as satellite from 'satellite.js';
import { subsolarPoint, solarElevation } from '@/lib/astro';
import { DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { cn } from '@/lib/cn';

interface SatTle { norad: number; name: string; line1: string; line2: string }
interface SatState { norad: number; name: string; lat: number; lon: number; altKm: number; speedKmS: number }
type SatRec = ReturnType<typeof satellite.twoline2satrec>;

const EARTH_R = 6371;

// Module-level cache so we fetch the world outline only once.
let worldCache: number[][][] | null = null;
async function loadWorld(): Promise<number[][][]> {
  if (worldCache) return worldCache;
  const res = await fetch('/world-110m.json', { cache: 'force-cache' });
  const gj = (await res.json()) as { features: { geometry: { type: string; coordinates: unknown } }[] };
  const polys: number[][][] = [];
  for (const f of gj.features) {
    const g = f.geometry;
    if (g.type === 'Polygon') for (const ring of g.coordinates as number[][][]) polys.push(ring);
    else if (g.type === 'MultiPolygon') for (const poly of g.coordinates as number[][][][]) for (const ring of poly) polys.push(ring);
  }
  worldCache = polys;
  return polys;
}

function cssRgb(el: HTMLElement, name: string): [number, number, number] {
  const v = getComputedStyle(el).getPropertyValue(name).trim().split(/\s+/).map(Number);
  return [v[0] || 0, v[1] || 0, v[2] || 0];
}

function destPoint(lat: number, lon: number, angRad: number, bearingRad: number): [number, number] {
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(angRad) + Math.cos(φ1) * Math.sin(angRad) * Math.cos(bearingRad));
  const λ2 = λ1 + Math.atan2(Math.sin(bearingRad) * Math.sin(angRad) * Math.cos(φ1), Math.cos(angRad) - Math.sin(φ1) * Math.sin(φ2));
  return [(φ2 * 180) / Math.PI, (((λ2 * 180) / Math.PI + 540) % 360) - 180];
}

export function WorldMap({ mini = false, height }: { mini?: boolean; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tles, setTles] = useState<SatTle[]>([]);
  const [observer, setObserver] = useState<{ lat: number; lon: number } | null>(null);
  const [states, setStates] = useState<SatState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFootprints, setShowFootprints] = useState(!mini);
  const [showTracks, setShowTracks] = useState(!mini);
  const [selected, setSelected] = useState<Set<number>>(new Set(DEFAULT_PRESETS.map((p) => p.norad)));

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Fetch TLEs.
  useEffect(() => {
    const ids = Array.from(selected).join(',');
    fetch(`/api/satellites/tles${ids ? `?norad=${ids}` : ''}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setObserver(d.observer);
        setTles(d.sats ?? []);
        if (!d.sats?.length) setError('No TLE data cached yet — a refresh was queued. Try again shortly.');
        else setError(null);
      })
      .catch(() => setError('Could not load satellite data.'));
  }, [selected]);

  const satrecs = useMemo(
    () => tles.map((t) => ({ norad: t.norad, name: t.name, rec: satellite.twoline2satrec(t.line1, t.line2) })),
    [tles],
  );

  // Compute current sat states + redraw on a 1 s cadence (or once if reduced motion).
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let world: number[][][] | null = worldCache;
    loadWorld().then((w) => { world = w; draw(); }).catch(() => undefined);

    function project(lat: number, lon: number, W: number, H: number): [number, number] {
      return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
    }

    function computeStates(now: Date): SatState[] {
      const gmst = satellite.gstime(now);
      const out: SatState[] = [];
      for (const s of satrecs) {
        const pv = satellite.propagate(s.rec, now);
        if (!pv.position || typeof pv.position === 'boolean') continue;
        const geo = satellite.eciToGeodetic(pv.position, gmst);
        const speed =
          pv.velocity && typeof pv.velocity !== 'boolean'
            ? Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z)
            : 0;
        out.push({
          norad: s.norad,
          name: s.name,
          lat: satellite.degreesLat(geo.latitude),
          lon: satellite.degreesLong(geo.longitude),
          altKm: geo.height,
          speedKmS: speed,
        });
      }
      return out;
    }

    function groundTrack(rec: satellite.SatRec, now: Date): [number, number][] {
      const pts: [number, number][] = [];
      for (let m = 0; m <= 95; m += 2) {
        const t = new Date(now.getTime() + m * 60000);
        const pv = satellite.propagate(rec, t);
        if (!pv.position || typeof pv.position === 'boolean') continue;
        const geo = satellite.eciToGeodetic(pv.position, satellite.gstime(t));
        pts.push([satellite.degreesLat(geo.latitude), satellite.degreesLong(geo.longitude)]);
      }
      return pts;
    }

    function drawPolyline(ctx: CanvasRenderingContext2D, pts: [number, number][], W: number, H: number) {
      let prevX: number | null = null;
      ctx.beginPath();
      for (const [lat, lon] of pts) {
        const [x, y] = project(lat, lon, W, H);
        if (prevX !== null && Math.abs(x - prevX) > W / 2) {
          ctx.stroke();
          ctx.beginPath();
        }
        if (prevX === null || Math.abs(x - prevX) > W / 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        prevX = x;
      }
      ctx.stroke();
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = wrap!.clientWidth;
      const H = height ?? (mini ? Math.round(W * 0.42) : Math.round(W * 0.5));
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      const ctx = canvas!.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = cssRgb(wrap!, '--elevated');
      const surf = cssRgb(wrap!, '--surface');
      const accent = cssRgb(wrap!, '--accent');
      const accent2 = cssRgb(wrap!, '--accent-2');
      const muted = cssRgb(wrap!, '--muted');
      const border = cssRgb(wrap!, '--border');

      // Ocean
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      ctx.fillRect(0, 0, W, H);

      // Land
      if (world) {
        ctx.fillStyle = `rgba(${surf[0]},${surf[1]},${surf[2]},0.9)`;
        ctx.strokeStyle = `rgba(${border[0]},${border[1]},${border[2]},0.9)`;
        ctx.lineWidth = 0.6;
        for (const ring of world) {
          ctx.beginPath();
          for (let i = 0; i < ring.length; i++) {
            const [lon, lat] = ring[i];
            const [x, y] = project(lat, lon, W, H);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.fill();
          ctx.stroke();
        }
      }

      // Night + grey-line shading (coarse cell grid; robust at all declinations).
      const sub = subsolarPoint(new Date());
      const step = Math.max(4, Math.round(W / 200));
      for (let px = 0; px < W; px += step) {
        const lon = (px / W) * 360 - 180;
        for (let py = 0; py < H; py += step) {
          const lat = 90 - (py / H) * 180;
          const el = solarElevation(lat, lon, sub);
          if (el > 6) continue; // full day
          if (el < -6) {
            ctx.fillStyle = 'rgba(2,6,18,0.58)'; // night
          } else {
            // grey line / twilight band — warm glow
            const a = 0.10 + (1 - Math.abs(el) / 6) * 0.16;
            ctx.fillStyle = `rgba(${accent2[0]},${accent2[1]},${accent2[2]},${a})`;
          }
          ctx.fillRect(px, py, step, step);
        }
      }

      // Graticule
      ctx.strokeStyle = `rgba(${muted[0]},${muted[1]},${muted[2]},0.14)`;
      ctx.lineWidth = 0.5;
      for (let lon = -180; lon <= 180; lon += 30) { const [x] = project(0, lon, W, H); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { const [, y] = project(lat, 0, W, H); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const now = new Date();
      const sats = computeStates(now);

      // Footprints + tracks + dots
      for (let i = 0; i < satrecs.length; i++) {
        const st = sats.find((s) => s.norad === satrecs[i].norad);
        if (!st) continue;

        if (showFootprints) {
          const ang = Math.acos(EARTH_R / (EARTH_R + st.altKm));
          const fp: [number, number][] = [];
          for (let b = 0; b <= 360; b += 8) fp.push(destPoint(st.lat, st.lon, ang, (b * Math.PI) / 180));
          ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.10)`;
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.35)`;
          ctx.lineWidth = 1;
          // draw as small segments to tolerate wrap
          drawPolyline(ctx, [...fp, fp[0]], W, H);
        }

        if (showTracks) {
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.55)`;
          ctx.lineWidth = 1.4;
          drawPolyline(ctx, groundTrack(satrecs[i].rec, now), W, H);
        }

        const [x, y] = project(st.lat, st.lon, W, H);
        ctx.beginPath();
        ctx.arc(x, y, mini ? 3 : 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${accent[0]},${accent[1]},${accent[2]})`;
        ctx.shadowColor = `rgba(${accent[0]},${accent[1]},${accent[2]},0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (!mini) {
          ctx.fillStyle = `rgb(${cssRgb(wrap!, '--fg').join(',')})`;
          ctx.font = '11px system-ui, sans-serif';
          ctx.fillText(st.name.replace(/\s*\(.*\)/, ''), x + 7, y + 3);
        }
      }

      // QTH
      if (observer) {
        const [x, y] = project(observer.lat, observer.lon, W, H);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${accent2[0]},${accent2[1]},${accent2[2]})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${accent2[0]},${accent2[1]},${accent2[2]},0.6)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      setStates(sats);
    }

    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    let timer: ReturnType<typeof setInterval> | null = null;
    if (!reducedMotion) timer = setInterval(draw, 1000);
    return () => {
      window.removeEventListener('resize', onResize);
      if (timer) clearInterval(timer);
    };
  }, [satrecs, observer, showFootprints, showTracks, mini, height, reducedMotion]);

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-xl border border-border bg-elevated">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="World map with day/night terminator and live satellite positions"
        className="block w-full"
      />
      {error ? (
        <div className="absolute inset-x-0 bottom-0 bg-warning/15 px-3 py-1.5 text-xs text-warning">{error}</div>
      ) : null}
      {!mini ? (
        <div className="absolute right-2 top-2 flex flex-wrap gap-1.5">
          <Toggle on={showTracks} onClick={() => setShowTracks((v) => !v)}>Tracks</Toggle>
          <Toggle on={showFootprints} onClick={() => setShowFootprints((v) => !v)}>Footprints</Toggle>
        </div>
      ) : null}
      {/* Screen-reader / no-JS data alternative */}
      <ul className="sr-only">
        {states.map((s) => (
          <li key={s.norad}>{s.name}: {s.lat.toFixed(1)}°, {s.lon.toFixed(1)}°, {s.altKm.toFixed(0)} km altitude, {s.speedKmS.toFixed(1)} km/s</li>
        ))}
      </ul>
      {!mini && states.length > 0 ? (
        <div className="border-t border-border bg-surface p-3">
          <ul className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            {states.map((s) => (
              <li key={s.norad} className="rounded-lg border border-border px-2 py-1.5">
                <Link href={`/tools/satellites/${s.norad}`} className="font-medium hover:text-accent">{s.name.replace(/\s*\(.*\)/, '')}</Link>
                <div className="font-mono text-muted">{s.lat.toFixed(1)}°, {s.lon.toFixed(1)}° · {s.altKm.toFixed(0)} km</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs backdrop-blur',
        on ? 'border-accent bg-accent/80 text-accent-fg' : 'border-border bg-surface/80 text-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
