'use client';
import { useMemo, useState } from 'react';
import { OPERATING_FREQS } from '@/lib/tools/operating';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function OperatingFreqPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return OPERATING_FREQS;
    return OPERATING_FREQS.filter((f) => [f.band, f.freqMHz, f.mode, f.purpose].some((x) => x.toLowerCase().includes(n)));
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Common operating frequencies"
        description="Calling frequencies, simplex, and digital dial frequencies by band (US/IARU-R2 — verify locally)."
      />
      <label htmlFor="of" className="sr-only">Search frequencies</label>
      <Input id="of" type="search" placeholder="Search band, mode, MHz…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-6 max-w-md" />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Band</th>
              <th className="px-4 py-2 font-semibold">Frequency</th>
              <th className="px-4 py-2 font-semibold">Mode</th>
              <th className="px-4 py-2 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-2"><Badge>{f.band}</Badge></td>
                <td className="px-4 py-2 font-mono">{f.freqMHz} MHz</td>
                <td className="px-4 py-2">{f.mode}</td>
                <td className="px-4 py-2 text-fg/85">{f.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
