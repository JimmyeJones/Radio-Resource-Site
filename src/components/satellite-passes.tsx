'use client';
import { useEffect, useState } from 'react';
import { SkyPlot } from '@/components/sky-plot';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Pass {
  satellite: string;
  norad: number;
  aos: number;
  los: number;
  maxElevationDeg: number;
  durationS: number;
  startAzimuthDeg: number;
  endAzimuthDeg: number;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const bearing = (d: number) => `${COMPASS[Math.round(d / 45) % 8]} (${Math.round(d)}°)`;
const when = (u: number) =>
  new Date(u * 1000).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function SatellitePasses({ norad }: { norad: number }) {
  const [passes, setPasses] = useState<Pass[] | null>(null);
  const [track, setTrack] = useState<{ az: number; el: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/satellites?norad=${norad}&hours=96`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        setPasses(d.passes ?? []);
      })
      .catch(() => setError('Could not load passes'));
    fetch(`/api/satellites/next?norad=${norad}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.pass) setTrack(d.pass.track);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [norad]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Upcoming passes</h2>
        {error ? (
          <Card className="border-warning/40 bg-warning/10 text-warning"><p>{error}</p></Card>
        ) : !passes ? (
          <p className="text-muted">Computing…</p>
        ) : passes.length === 0 ? (
          <Card className="text-muted"><p>No passes in the next 96 hours.</p></Card>
        ) : (
          <ul className="space-y-2">
            {passes.map((p) => (
              <li key={p.aos} className="rounded-lg border border-border bg-surface p-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{when(p.aos)}</span>
                  <Badge tone={p.maxElevationDeg >= 30 ? 'success' : p.maxElevationDeg >= 10 ? 'accent' : 'neutral'}>
                    max {Math.round(p.maxElevationDeg)}°
                  </Badge>
                </div>
                <p className="mt-1 text-muted">
                  AOS {bearing(p.startAzimuthDeg)} → LOS {bearing(p.endAzimuthDeg)} · {Math.round(p.durationS / 60)} min
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Next pass sky track</h2>
        {track && track.length > 1 ? (
          <Card className="flex justify-center">
            <SkyPlot track={track} size={220} />
          </Card>
        ) : (
          <Card className="text-muted"><p>No track available.</p></Card>
        )}
      </div>
    </div>
  );
}
