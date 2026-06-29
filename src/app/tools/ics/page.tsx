'use client';
import { useMemo, useState } from 'react';
import { ICS } from '@/lib/tools/ics';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function IcsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return ICS;
    return ICS.filter((i) => [i.part, i.category, i.description, i.keySpecs].some((x) => x.toLowerCase().includes(n)));
  }, [q]);

  return (
    <div>
      <PageHeader title="Common ICs & regulators" description="Frequently-used parts with key specs and gotchas." />
      <label htmlFor="ic" className="sr-only">Search ICs</label>
      <Input id="ic" type="search" placeholder="Search part or category…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-6 max-w-md" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((i) => (
          <li key={i.part} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono font-semibold">{i.part}</h2>
              <Badge>{i.category}</Badge>
            </div>
            <p className="mt-1 text-sm">{i.description}</p>
            <p className="mt-2 text-xs text-muted">{i.keySpecs}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
