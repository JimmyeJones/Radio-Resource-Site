'use client';
import { useState } from 'react';
import { MORSE, toMorse, RST_READABILITY, RST_STRENGTH, RST_TONE, PROSIGNS } from '@/lib/tools/cw';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CwPage() {
  const [text, setText] = useState('CQ DE');
  return (
    <div>
      <PageHeader title="CW reference" description="Morse table & translator, the RST system, and common prosigns/abbreviations." />

      <Card className="mb-6">
        <CardTitle className="mb-2">Text → Morse</CardTitle>
        <label htmlFor="cw-in" className="sr-only">Text to convert</label>
        <Input id="cw-in" value={text} onChange={(e) => setText(e.target.value)} className="font-mono" />
        <p className="mt-3 break-words font-mono text-lg text-accent" aria-live="polite">{toMorse(text) || '—'}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Morse alphabet</CardTitle>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {Object.entries(MORSE).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1 text-sm">
                <span className="font-semibold">{k}</span>
                <span className="font-mono text-accent">{v}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">RST system</CardTitle>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="mb-1 font-semibold">R — Readability</p>
                <ul className="space-y-0.5 text-muted">{RST_READABILITY.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 font-semibold">S — Strength</p>
                <ul className="space-y-0.5 text-muted">{RST_STRENGTH.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 font-semibold">T — Tone (CW)</p>
                <ul className="space-y-0.5 text-muted">{RST_TONE.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-3">Prosigns & abbreviations</CardTitle>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {PROSIGNS.map((p) => (
                <li key={p.sign} className="flex gap-2 text-sm">
                  <span className="w-12 shrink-0 font-mono font-semibold text-accent">{p.sign}</span>
                  <span className="text-fg/85">{p.meaning}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
