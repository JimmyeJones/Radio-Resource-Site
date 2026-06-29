'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkyPlot } from '@/components/sky-plot';
import { Satellite } from 'lucide-react';

interface NextPass {
  satellite: string;
  norad: number;
  aos: number;
  los: number;
  maxElevationDeg: number;
  durationS: number;
  startAz: number;
  endAz: number;
  downlinkMHz: number | null;
  track: { az: number; el: number; dopplerHz: number | null }[];
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const bearing = (d: number) => COMPASS[Math.round(d / 45) % 8];

function countdown(toUnix: number): string {
  const s = Math.max(0, Math.round(toUnix - Date.now() / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function NextPassWidget() {
  const [pass, setPass] = useState<NextPass | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/satellites/next', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        else setPass(d.pass);
      })
      .catch(() => setError('Could not load passes'));
    return () => {
      cancelled = true;
    };
  }, []);

  // re-render once a second for the countdown
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (error) return null; // QTH not set or no TLEs — stay quiet on the dashboard
  if (!pass) return null;

  const live = Date.now() / 1000 >= pass.aos && Date.now() / 1000 <= pass.los;
  const maxDoppler = pass.track.reduce((m, p) => Math.max(m, Math.abs(p.dopplerHz ?? 0)), 0);

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SkyPlot track={pass.track.map((p) => ({ az: p.az, el: p.el }))} size={180} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Satellite className="h-4 w-4 text-accent" aria-hidden />
            <CardTitle className="text-base">Next pass: {pass.satellite}</CardTitle>
            {live ? <Badge tone="success">overhead now</Badge> : null}
          </div>
          <p className="text-sm text-muted">
            {live ? 'In progress' : `AOS in ${countdown(pass.aos)}`} · max elevation {pass.maxElevationDeg}° ·{' '}
            {Math.round(pass.durationS / 60)} min
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted">AOS bearing</dt><dd>{bearing(pass.startAz)} ({pass.startAz}°)</dd></div>
            <div><dt className="text-xs text-muted">LOS bearing</dt><dd>{bearing(pass.endAz)} ({pass.endAz}°)</dd></div>
            {pass.downlinkMHz ? (
              <div>
                <dt className="text-xs text-muted">Downlink</dt>
                <dd>{pass.downlinkMHz} MHz {maxDoppler ? `±${(maxDoppler / 1000).toFixed(1)} kHz` : ''}</dd>
              </div>
            ) : null}
          </dl>
          <Link href={`/tools/satellites/${pass.norad}`} className="mt-3 inline-block text-sm text-accent hover:underline">
            Satellite details →
          </Link>
        </div>
      </div>
    </Card>
  );
}
