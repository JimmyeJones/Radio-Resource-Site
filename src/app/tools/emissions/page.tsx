'use client';
import { useState } from 'react';
import { decodeEmission, COMMON_EMISSIONS, MODULATION, SIGNAL, INFORMATION } from '@/lib/tools/emissions';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function EmissionsPage() {
  const [code, setCode] = useState('F3E');
  const decoded = decodeEmission(code);

  return (
    <div>
      <PageHeader title="ITU emission designators" description="Decode emission codes like F3E, A1A, or J3E." />

      <Card className="mb-6 max-w-xl">
        <CardTitle className="mb-2">Decoder</CardTitle>
        <label htmlFor="em" className="sr-only">Emission code</label>
        <Input id="em" value={code} onChange={(e) => setCode(e.target.value)} className="font-mono uppercase" placeholder="F3E" />
        {decoded ? (
          <dl className="mt-4 space-y-1 text-sm" aria-live="polite">
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">Modulation</dt><dd>{decoded.modulation}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">Signal</dt><dd>{decoded.signal}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">Information</dt><dd>{decoded.information}</dd></div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">Enter a 3-character code (or one with a bandwidth prefix like 16K0F3E).</p>
        )}
      </Card>

      <Card className="mb-6">
        <CardTitle className="mb-3">Common emissions</CardTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COMMON_EMISSIONS.map((e) => (
            <li key={e.code} className="flex gap-2 rounded border border-border px-3 py-2 text-sm">
              <span className="w-12 shrink-0 font-mono font-semibold text-accent">{e.code}</span>
              <span>{e.meaning}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: '1st — Modulation', data: MODULATION },
          { title: '2nd — Signal', data: SIGNAL },
          { title: '3rd — Information', data: INFORMATION },
        ].map((col) => (
          <Card key={col.title}>
            <CardTitle className="mb-3 text-base">{col.title}</CardTitle>
            <ul className="space-y-1 text-sm">
              {Object.entries(col.data).map(([k, v]) => (
                <li key={k} className="flex gap-2">
                  <span className="w-5 shrink-0 font-mono font-semibold text-accent">{k}</span>
                  <span className="text-fg/85">{v}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
