'use client';
import { useMemo, useState } from 'react';
import { SIGNALS } from '@/lib/tools/signals';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SignalsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return SIGNALS;
    return SIGNALS.filter((s) =>
      [s.name, s.freq, s.mode, s.description, s.band].some((f) => f.toLowerCase().includes(n)),
    );
  }, [q]);

  return (
    <div>
      <PageHeader title="Signal ID reference" description="Identify common signals you encounter on a waterfall." />
      <label htmlFor="sig" className="sr-only">Search signals</label>
      <Input id="sig" type="search" placeholder="Search name, mode, frequency…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-6 max-w-md" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((s) => (
          <li key={s.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{s.name}</h2>
              <Badge tone="accent">{s.band}</Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-muted">{s.freq}</p>
            <p className="mt-2 text-sm">{s.description}</p>
            <p className="mt-2 text-xs text-muted">{s.mode} · {s.bandwidth}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
