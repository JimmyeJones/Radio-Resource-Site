'use client';
import { useMemo, useState } from 'react';
import { lookupCallsign, PREFIXES } from '@/lib/tools/prefixes';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrefixPage() {
  const [call, setCall] = useState('W1AW');
  const result = useMemo(() => lookupCallsign(call), [call]);

  return (
    <div>
      <PageHeader
        title="Callsign Prefix Lookup"
        description="Identify the country and CQ/ITU zones for an amateur callsign."
      />

      <Card className="mb-6">
        <label htmlFor="call" className="mb-2 block text-sm font-medium">
          Enter a callsign
        </label>
        <Input
          id="call"
          value={call}
          onChange={(e) => setCall(e.target.value)}
          autoComplete="off"
          className="font-mono uppercase"
          aria-describedby="call-result"
        />
        <div id="call-result" className="mt-4" aria-live="polite">
          {result.entry ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl" aria-hidden>
                {result.entry.flag}
              </span>
              <div>
                <CardTitle>{result.entry.country}</CardTitle>
                <CardDescription>
                  Matched prefix <span className="font-mono">{result.matchedPrefix}</span>
                </CardDescription>
              </div>
              <div className="ml-auto flex gap-2">
                {result.entry.cqZone ? <Badge tone="accent">CQ Zone {result.entry.cqZone}</Badge> : null}
                {result.entry.ituZone ? <Badge>ITU Zone {result.entry.ituZone}</Badge> : null}
                {result.entry.continent ? <Badge>{result.entry.continent}</Badge> : null}
              </div>
            </div>
          ) : (
            <p className="text-muted">No prefix match. Try a complete callsign.</p>
          )}
        </div>
      </Card>

      <details className="rounded-xl border border-border bg-surface p-5">
        <summary className="cursor-pointer font-medium">All known prefixes ({PREFIXES.length} entities)</summary>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PREFIXES.map((p) => (
            <li
              key={p.country}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span>
                <span className="mr-2 text-lg" aria-hidden>
                  {p.flag}
                </span>
                {p.country}
              </span>
              <span className="font-mono text-xs text-muted">{p.prefixes.slice(0, 4).join(', ')}{p.prefixes.length > 4 ? '…' : ''}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
