'use client';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

interface JobRow {
  id: string;
  kind: string;
  status: string;
  progress: number;
  message: string | null;
  error: string | null;
  createdAt: number;
}

export function JobFeed() {
  const [rows, setRows] = useState<JobRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch('/api/jobs', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as JobRow[];
        if (!cancelled) setRows(data);
      } catch { /* noop */ }
    }
    tick();
    const id = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (rows.length === 0) return null;
  return (
    <section aria-label="Background jobs" className="mb-6 rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Background activity
      </h2>
      <ul className="space-y-2">
        {rows.map((j) => (
          <li key={j.id} className="text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Badge tone={statusTone(j.status)}>{j.status}</Badge>
                <span className="font-mono text-xs">{j.kind}</span>
                <span className="text-muted">{j.message ?? ''}</span>
              </span>
              {j.status === 'running' ? (
                <span className="font-mono text-xs text-muted">{j.progress.toFixed(0)}%</span>
              ) : null}
            </div>
            {j.status === 'running' ? (
              <div
                className="mt-1 h-1 rounded-full bg-elevated"
                role="progressbar"
                aria-valuenow={Math.round(j.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${j.progress}%` }} />
              </div>
            ) : null}
            {j.error ? <p className="mt-1 text-xs text-danger">{j.error}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function statusTone(s: string): 'accent' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case 'running': return 'accent';
    case 'completed': return 'success';
    case 'queued': return 'neutral';
    case 'failed': return 'danger';
    default: return 'neutral';
  }
}
