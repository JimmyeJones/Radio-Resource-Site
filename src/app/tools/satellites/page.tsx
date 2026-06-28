'use client';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCcw } from 'lucide-react';
import { DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { cn } from '@/lib/cn';

interface SatPass {
  satellite: string;
  norad: number;
  aos: number;
  los: number;
  maxElevationDeg: number;
  startAzimuthDeg: number;
  endAzimuthDeg: number;
  durationS: number;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function bearing(deg: number) { return `${COMPASS[Math.round(deg / 45) % 8]} (${Math.round(deg)}°)`; }
function whenLabel(unix: number) {
  const d = new Date(unix * 1000);
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatDur(s: number) {
  const m = Math.floor(s / 60); const ss = s % 60;
  return `${m}m ${String(ss).padStart(2, '0')}s`;
}

export default function SatellitesPage() {
  const [passes, setPasses] = useState<SatPass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [observer, setObserver] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set(DEFAULT_PRESETS.map((p) => p.norad)));

  async function load() {
    setLoading(true);
    setError(null);
    const idsParam = Array.from(selected).join(',');
    try {
      const res = await fetch(`/api/satellites?hours=72&norad=${idsParam}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setObserver(data.observer);
      setPasses(data.passes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  const selectedKey = Array.from(selected).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [selectedKey]);

  return (
    <div>
      <PageHeader
        title="Satellite passes"
        description="Next passes over your QTH. Set your location in Settings if you haven't yet."
        actions={
          <>
            <Button variant="secondary" onClick={load}>
              <RefreshCcw className="h-4 w-4" aria-hidden /> Refresh
            </Button>
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-elevated px-4 text-sm font-medium hover:bg-border/60"
              href={`/api/satellites?format=ics&hours=72&norad=${Array.from(selected).join(',')}`}
            >
              <Download className="h-4 w-4" aria-hidden /> Export .ics
            </a>
          </>
        }
      />

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-medium">Satellites</legend>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_PRESETS.map((p) => {
            const on = selected.has(p.norad);
            return (
              <button
                key={p.norad}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setSelected((s) => {
                    const next = new Set(s);
                    if (next.has(p.norad)) next.delete(p.norad);
                    else next.add(p.norad);
                    return next;
                  });
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm',
                  on ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {observer ? (
        <p className="mb-4 text-sm text-muted">
          Observer: {observer.lat.toFixed(3)}°, {observer.lon.toFixed(3)}°
        </p>
      ) : null}

      {error ? (
        <Card className="border-warning/40 bg-warning/10 text-warning">
          <p>{error}</p>
        </Card>
      ) : loading ? (
        <p className="text-muted">Computing passes…</p>
      ) : passes && passes.length > 0 ? (
        <ul className="space-y-3">
          {passes.map((p) => (
            <li key={`${p.norad}-${p.aos}`}>
              <Card>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle>{p.satellite}</CardTitle>
                  <CardDescription>{whenLabel(p.aos)} → {whenLabel(p.los)}</CardDescription>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Stat label="Max elevation"><strong>{p.maxElevationDeg.toFixed(0)}°</strong></Stat>
                  <Stat label="Duration"><strong>{formatDur(p.durationS)}</strong></Stat>
                  <Stat label="AOS bearing">{bearing(p.startAzimuthDeg)}</Stat>
                  <Stat label="LOS bearing">{bearing(p.endAzimuthDeg)}</Stat>
                </div>
                <div className="mt-3">
                  <Badge tone={p.maxElevationDeg >= 30 ? 'success' : p.maxElevationDeg >= 10 ? 'accent' : 'neutral'}>
                    {p.maxElevationDeg >= 30 ? 'Great pass' : p.maxElevationDeg >= 10 ? 'Good pass' : 'Low pass'}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="text-center text-muted"><p>No upcoming passes in the selected window.</p></Card>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div>{children}</div>
    </div>
  );
}
