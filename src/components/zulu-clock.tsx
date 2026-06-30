'use client';
import { useEffect, useState } from 'react';

export function ZuluClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const z = (n: number) => String(n).padStart(2, '0');
  const utc = now
    ? `${now.getUTCFullYear()}-${z(now.getUTCMonth() + 1)}-${z(now.getUTCDate())} ${z(now.getUTCHours())}:${z(now.getUTCMinutes())}:${z(now.getUTCSeconds())}Z`
    : '—';
  const local = now ? now.toLocaleTimeString() : '—';

  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-center">
      <div className="text-xs uppercase tracking-wide text-muted">UTC / Zulu</div>
      <div className="mt-1 font-mono text-3xl font-semibold tabular-nums" aria-live="off">{utc}</div>
      <div className="mt-2 text-sm text-muted">Local: {local}</div>
    </div>
  );
}
