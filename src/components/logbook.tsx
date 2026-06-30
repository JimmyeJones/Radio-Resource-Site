'use client';
import { useMemo, useState, useTransition } from 'react';
import type { Qso } from '@/db/schema';
import { saveQsoAction, deleteQsoAction, exportAdifAction, importAdifAction } from '@/server/actions/qsos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Upload, Pencil, Trash2 } from 'lucide-react';

function whenLocal(unix: number) {
  return new Date(unix * 1000).toLocaleString(undefined, { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Logbook({ items }: { items: Qso[] }) {
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Qso | null>(null);
  const [pending, start] = useTransition();

  const stats = useMemo(() => {
    const countries = new Set(items.map((i) => i.country).filter(Boolean));
    const modes = new Map<string, number>();
    for (const i of items) if (i.mode) modes.set(i.mode, (modes.get(i.mode) ?? 0) + 1);
    return { total: items.length, countries: countries.size, modes };
  }, [items]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return items;
    return items.filter((i) => [i.callsign, i.band, i.mode, i.name, i.country, i.grid].some((f) => (f ?? '').toLowerCase().includes(n)));
  }, [items, q]);

  async function exportAdif() {
    const text = await exportAdifAction();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-${new Date().toISOString().slice(0, 10)}.adi`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="py-3"><div className="text-xs uppercase text-muted">QSOs</div><div className="text-2xl font-semibold">{stats.total}</div></Card>
        <Card className="py-3"><div className="text-xs uppercase text-muted">Countries</div><div className="text-2xl font-semibold">{stats.countries}</div></Card>
        <Card className="py-3">
          <div className="text-xs uppercase text-muted">Modes</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {Array.from(stats.modes.entries()).slice(0, 6).map(([m, n]) => <Badge key={m}>{m} {n}</Badge>)}
            {stats.modes.size === 0 ? <span className="text-sm text-muted">—</span> : null}
          </div>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="log-search" className="sr-only">Search log</label>
        <Input id="log-search" type="search" placeholder="Search callsign, mode, country…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        <Button onClick={() => { setAdding((v) => !v); setEditing(null); }}>
          <Plus className="h-4 w-4" aria-hidden /> {adding ? 'Cancel' : 'Log QSO'}
        </Button>
        <Button variant="secondary" onClick={exportAdif} disabled={items.length === 0}>
          <Download className="h-4 w-4" aria-hidden /> Export ADIF
        </Button>
        <Button variant="secondary" onClick={() => document.getElementById('adif-import')?.click()}>
          <Upload className="h-4 w-4" aria-hidden /> Import ADIF
        </Button>
        <input
          id="adif-import"
          type="file"
          accept=".adi,.adif,text/plain"
          aria-label="Import ADIF file"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const res = await importAdifAction(await f.text());
              alert(res.ok ? `Imported ${res.count} QSOs` : 'Import failed');
            }
            e.target.value = '';
          }}
        />
      </div>

      {(adding || editing) && <QsoForm key={editing?.id ?? 'new'} initial={editing} onDone={() => { setAdding(false); setEditing(null); }} />}

      {filtered.length === 0 ? (
        <Card className="text-center text-muted"><p>{items.length === 0 ? 'No contacts logged yet.' : 'No matches.'}</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Date/Time (UTC-ish)</th>
                <th className="px-3 py-2 font-semibold">Call</th>
                <th className="px-3 py-2 font-semibold">Band/Mode</th>
                <th className="px-3 py-2 font-semibold">RST</th>
                <th className="px-3 py-2 font-semibold">Country</th>
                <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} id={i.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">{whenLocal(i.qsoAt)}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{i.callsign}</td>
                  <td className="px-3 py-2">{[i.band, i.mode].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-3 py-2 font-mono">{[i.rstSent, i.rstRcvd].filter(Boolean).join('/') || '—'}</td>
                  <td className="px-3 py-2">{i.country ?? '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" aria-label={`Edit ${i.callsign}`} className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { setEditing(i); setAdding(false); }}>
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" aria-label={`Delete ${i.callsign}`} disabled={pending} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { if (confirm(`Delete QSO with ${i.callsign}?`)) start(() => void deleteQsoAction(i.id)); }}>
                      <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QsoForm({ initial, onDone }: { initial: Qso | null; onDone: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const d = initial ? new Date(initial.qsoAt * 1000) : new Date();
  const dateVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const timeVal = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <Card className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await saveQsoAction(fd);
            if (res?.ok) onDone();
            else setError(res?.error ?? 'Failed');
          });
        }}
        className="space-y-3"
      >
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="q-call" className="mb-1 block text-sm font-medium">Callsign</label>
            <Input id="q-call" name="callsign" required defaultValue={initial?.callsign ?? ''} className="font-mono uppercase" />
          </div>
          <div>
            <label htmlFor="q-date" className="mb-1 block text-sm font-medium">Date</label>
            <Input id="q-date" name="date" type="date" defaultValue={dateVal} />
          </div>
          <div>
            <label htmlFor="q-time" className="mb-1 block text-sm font-medium">Time</label>
            <Input id="q-time" name="time" type="time" defaultValue={timeVal} />
          </div>
          <div>
            <label htmlFor="q-freq" className="mb-1 block text-sm font-medium">Freq (MHz)</label>
            <Input id="q-freq" name="freqMhz" type="number" step="0.0001" defaultValue={initial?.freqMhz ?? ''} />
          </div>
          <div>
            <label htmlFor="q-band" className="mb-1 block text-sm font-medium">Band</label>
            <Input id="q-band" name="band" defaultValue={initial?.band ?? ''} placeholder="20m" />
          </div>
          <div>
            <label htmlFor="q-mode" className="mb-1 block text-sm font-medium">Mode</label>
            <Input id="q-mode" name="mode" defaultValue={initial?.mode ?? ''} placeholder="SSB / FT8 / CW" />
          </div>
          <div>
            <label htmlFor="q-rs" className="mb-1 block text-sm font-medium">RST sent</label>
            <Input id="q-rs" name="rstSent" defaultValue={initial?.rstSent ?? ''} placeholder="59" />
          </div>
          <div>
            <label htmlFor="q-rr" className="mb-1 block text-sm font-medium">RST rcvd</label>
            <Input id="q-rr" name="rstRcvd" defaultValue={initial?.rstRcvd ?? ''} placeholder="59" />
          </div>
          <div>
            <label htmlFor="q-name" className="mb-1 block text-sm font-medium">Name</label>
            <Input id="q-name" name="name" defaultValue={initial?.name ?? ''} />
          </div>
          <div>
            <label htmlFor="q-grid" className="mb-1 block text-sm font-medium">Grid</label>
            <Input id="q-grid" name="grid" defaultValue={initial?.grid ?? ''} placeholder="FN31" />
          </div>
          <div>
            <label htmlFor="q-qth" className="mb-1 block text-sm font-medium">QTH</label>
            <Input id="q-qth" name="qth" defaultValue={initial?.qth ?? ''} />
          </div>
          <div>
            <label htmlFor="q-sat" className="mb-1 block text-sm font-medium">Satellite</label>
            <Input id="q-sat" name="satellite" defaultValue={initial?.satellite ?? ''} placeholder="SO-50" />
          </div>
        </div>
        <div>
          <label htmlFor="q-notes" className="mb-1 block text-sm font-medium">Notes</label>
          <Textarea id="q-notes" name="notes" rows={2} defaultValue={initial?.notes ?? ''} />
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{initial ? 'Save' : 'Log it'}</Button>
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
