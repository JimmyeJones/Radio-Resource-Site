'use client';
import { useState, useTransition } from 'react';
import type { StorageStats } from '@/server/actions/storage';
import { clearFailedJobsAction, clearCompletedJobsAction } from '@/server/actions/storage';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download } from 'lucide-react';

function fmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} kB`;
  return `${n} B`;
}

export function StoragePanel({ stats }: { stats: StorageStats }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const total = stats.youtube + stats.articles + stats.datasheets + stats.database;

  const rows = [
    { label: 'YouTube videos', value: stats.youtube },
    { label: 'Articles', value: stats.articles },
    { label: 'Datasheets', value: stats.datasheets },
    { label: 'Database', value: stats.database },
  ];

  return (
    <Card>
      <CardTitle className="mb-1 flex items-center gap-2">
        <Database className="h-4 w-4 text-accent" aria-hidden /> Storage &amp; backup
      </CardTitle>
      <CardDescription className="mb-4">Disk usage by category, a one-click DB backup, and job cleanup.</CardDescription>

      <ul className="mb-4 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between">
            <span className="text-muted">{r.label}</span>
            <span className="font-mono">{fmtBytes(r.value)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-border pt-1 font-medium">
          <span>Total</span>
          <span className="font-mono">{fmtBytes(total)}</span>
        </li>
      </ul>

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/backup"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          <Download className="h-4 w-4" aria-hidden /> Download DB backup
        </a>
        <Button
          variant="secondary"
          disabled={pending || stats.failedJobs === 0}
          onClick={() => start(async () => { const r = await clearFailedJobsAction(); setMsg(`Removed ${r.removed} failed job(s).`); })}
        >
          Clear failed jobs ({stats.failedJobs})
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => start(async () => { const r = await clearCompletedJobsAction(); setMsg(`Removed ${r.removed} completed job(s).`); })}
        >
          Clear completed jobs
        </Button>
      </div>
      {msg ? <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">{msg}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Restore by replacing <code>app.db</code> in your data volume with a backup file while the app is stopped.
      </p>
    </Card>
  );
}
