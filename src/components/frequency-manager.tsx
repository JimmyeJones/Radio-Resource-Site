'use client';
import { useMemo, useState, useTransition } from 'react';
import type { Frequency } from '@/db/schema';
import { saveFrequencyAction, deleteFrequencyAction, importFrequenciesAction } from '@/server/actions/frequencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { Plus, Download, Upload, Pencil, Trash2 } from 'lucide-react';

function fmtMHz(hz: number) {
  return (hz / 1e6).toFixed(4).replace(/\.?0+$/, '');
}

export function FrequencyManager({ items }: { items: Frequency[] }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Frequency | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of items) for (const t of f.tags ?? []) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((f) => {
      if (tag && !(f.tags ?? []).includes(tag)) return false;
      if (!needle) return true;
      return (
        f.name.toLowerCase().includes(needle) ||
        fmtMHz(f.freqHz).includes(needle) ||
        (f.mode ?? '').toLowerCase().includes(needle) ||
        (f.band ?? '').toLowerCase().includes(needle) ||
        (f.location ?? '').toLowerCase().includes(needle)
      );
    });
  }, [items, q, tag]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(items.map((f) => ({ ...f, freqMHz: f.freqHz / 1e6 })), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frequencies-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="freq-search" className="sr-only">Search frequencies</label>
        <Input id="freq-search" type="search" placeholder="Search name, MHz, mode, location…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        <Button onClick={() => { setAdding((v) => !v); setEditing(null); }}>
          <Plus className="h-4 w-4" aria-hidden /> {adding ? 'Cancel' : 'Add'}
        </Button>
        <Button variant="secondary" onClick={exportJson} disabled={items.length === 0}>
          <Download className="h-4 w-4" aria-hidden /> Export
        </Button>
        <Button variant="secondary" onClick={() => document.getElementById('freq-import')?.click()}>
          <Upload className="h-4 w-4" aria-hidden /> Import
        </Button>
        <input
          id="freq-import"
          type="file"
          accept="application/json"
          aria-label="Import frequencies JSON"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const res = await importFrequenciesAction(await f.text());
              alert(res.ok ? `Imported ${res.count}` : `Failed: ${res.error}`);
            }
            e.target.value = '';
          }}
        />
      </div>

      {(adding || editing) && <FreqForm key={editing?.id ?? 'new'} initial={editing} onDone={() => { setAdding(false); setEditing(null); }} />}

      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setTag(null)} className={cn('rounded-full border px-3 py-1 text-xs', tag === null ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated')}>
            All ({items.length})
          </button>
          {tags.map(([t, n]) => (
            <button key={t} type="button" onClick={() => setTag((c) => (c === t ? null : t))} className={cn('rounded-full border px-3 py-1 text-xs', tag === t ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated')}>
              {t} ({n})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center text-muted"><p>{items.length === 0 ? 'No frequencies yet. Add one above.' : 'No matches.'}</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Frequency</th>
                <th className="px-4 py-2 font-semibold">Mode</th>
                <th className="px-4 py-2 font-semibold">Location</th>
                <th className="px-4 py-2 font-semibold">Tags</th>
                <th className="px-4 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} id={f.id} className="border-t border-border align-top">
                  <td className="px-4 py-2 font-medium">{f.name}</td>
                  <td className="px-4 py-2 font-mono">{fmtMHz(f.freqHz)} MHz</td>
                  <td className="px-4 py-2">{f.mode ?? '—'}</td>
                  <td className="px-4 py-2">{f.location ?? '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">{(f.tags ?? []).map((t) => <Badge key={t}>{t}</Badge>)}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button type="button" aria-label={`Edit ${f.name}`} className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { setEditing(f); setAdding(false); }}>
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" aria-label={`Delete ${f.name}`} disabled={pending} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { if (confirm(`Delete ${f.name}?`)) start(() => void deleteFrequencyAction(f.id)); }}>
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

function FreqForm({ initial, onDone }: { initial: Frequency | null; onDone: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <Card className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await saveFrequencyAction(fd);
            if (res?.ok) onDone();
            else setError(res?.error ?? 'Failed');
          });
        }}
        className="space-y-3"
      >
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="f-name" className="mb-1 block text-sm font-medium">Name</label>
            <Input id="f-name" name="name" required defaultValue={initial?.name ?? ''} placeholder="2m calling frequency" />
          </div>
          <div>
            <label htmlFor="f-freq" className="mb-1 block text-sm font-medium">Frequency (MHz)</label>
            <Input id="f-freq" name="freqMHz" type="number" step="0.0001" required defaultValue={initial ? initial.freqHz / 1e6 : ''} />
          </div>
          <div>
            <label htmlFor="f-mode" className="mb-1 block text-sm font-medium">Mode</label>
            <Input id="f-mode" name="mode" defaultValue={initial?.mode ?? ''} placeholder="FM / SSB / APT" />
          </div>
          <div>
            <label htmlFor="f-band" className="mb-1 block text-sm font-medium">Band</label>
            <Input id="f-band" name="band" defaultValue={initial?.band ?? ''} placeholder="2m / 70cm / 137 MHz" />
          </div>
          <div>
            <label htmlFor="f-loc" className="mb-1 block text-sm font-medium">Location</label>
            <Input id="f-loc" name="location" defaultValue={initial?.location ?? ''} />
          </div>
          <div>
            <label htmlFor="f-tags" className="mb-1 block text-sm font-medium">Tags</label>
            <Input id="f-tags" name="tags" defaultValue={(initial?.tags ?? []).join(', ')} placeholder="satellite, weather" />
          </div>
        </div>
        <div>
          <label htmlFor="f-notes" className="mb-1 block text-sm font-medium">Notes</label>
          <Textarea id="f-notes" name="notes" rows={2} defaultValue={initial?.notes ?? ''} />
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{initial ? 'Save' : 'Add frequency'}</Button>
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
