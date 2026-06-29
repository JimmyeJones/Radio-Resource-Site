'use client';
import { useMemo, useState, useTransition } from 'react';
import type { Part } from '@/db/schema';
import { savePartAction, deletePartAction, adjustPartQtyAction } from '@/server/actions/parts';
import { AddToProject } from '@/components/add-to-project';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { Plus, Pencil, Trash2, Minus } from 'lucide-react';

export function PartsManager({ items, projects }: { items: Part[]; projects: { id: string; name: string }[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [pending, start] = useTransition();

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) if (p.category) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!n) return true;
      return [p.name, p.partNumber, p.manufacturer, p.value, p.pkg, p.location].some((f) => (f ?? '').toLowerCase().includes(n));
    });
  }, [items, q, cat]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="parts-search" className="sr-only">Search parts</label>
        <Input id="parts-search" type="search" placeholder="Search name, part #, value…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        <Button onClick={() => { setAdding((v) => !v); setEditing(null); }}>
          <Plus className="h-4 w-4" aria-hidden /> {adding ? 'Cancel' : 'Add part'}
        </Button>
      </div>

      {(adding || editing) && <PartForm key={editing?.id ?? 'new'} initial={editing} onDone={() => { setAdding(false); setEditing(null); }} />}

      {cats.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setCat(null)} className={cn('rounded-full border px-3 py-1 text-xs', cat === null ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated')}>
            All ({items.length})
          </button>
          {cats.map(([c, n]) => (
            <button key={c} type="button" onClick={() => setCat((v) => (v === c ? null : c))} className={cn('rounded-full border px-3 py-1 text-xs', cat === c ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated')}>
              {c} ({n})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center text-muted"><p>{items.length === 0 ? 'No parts yet. Add your first component.' : 'No matches.'}</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Part</th>
                <th className="px-3 py-2 font-semibold">Value / Pkg</th>
                <th className="px-3 py-2 font-semibold">Location</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const low = p.qty <= p.minQty;
                return (
                  <tr key={p.id} id={p.id} className="border-t border-border align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted">{[p.manufacturer, p.partNumber].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td className="px-3 py-2">{[p.value, p.pkg].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="px-3 py-2">{p.location ?? '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label={`Decrease ${p.name}`} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border hover:bg-elevated" onClick={() => start(() => void adjustPartQtyAction(p.id, -1))}>
                          <Minus className="h-3 w-3" aria-hidden />
                        </button>
                        <span className={cn('w-8 text-center font-mono', low && 'text-danger font-semibold')}>{p.qty}</span>
                        <button type="button" aria-label={`Increase ${p.name}`} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border hover:bg-elevated" onClick={() => start(() => void adjustPartQtyAction(p.id, 1))}>
                          <Plus className="h-3 w-3" aria-hidden />
                        </button>
                        {low ? <Badge tone="danger">low</Badge> : null}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <AddToProject itemType="part" itemId={p.id} projects={projects} />
                        <button type="button" aria-label={`Edit ${p.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { setEditing(p); setAdding(false); }}>
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button type="button" aria-label={`Delete ${p.name}`} disabled={pending} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated" onClick={() => { if (confirm(`Delete ${p.name}?`)) start(() => void deletePartAction(p.id)); }}>
                          <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PartForm({ initial, onDone }: { initial: Part | null; onDone: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <Card className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await savePartAction(fd);
            if (res?.ok) onDone();
            else setError(res?.error ?? 'Failed');
          });
        }}
        className="space-y-3"
      >
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="p-name" className="mb-1 block text-sm font-medium">Name</label>
            <Input id="p-name" name="name" required defaultValue={initial?.name ?? ''} placeholder="10k resistor" />
          </div>
          <div>
            <label htmlFor="p-cat" className="mb-1 block text-sm font-medium">Category</label>
            <Input id="p-cat" name="category" defaultValue={initial?.category ?? ''} placeholder="Resistor" />
          </div>
          <div>
            <label htmlFor="p-pn" className="mb-1 block text-sm font-medium">Part number</label>
            <Input id="p-pn" name="partNumber" defaultValue={initial?.partNumber ?? ''} />
          </div>
          <div>
            <label htmlFor="p-mfr" className="mb-1 block text-sm font-medium">Manufacturer</label>
            <Input id="p-mfr" name="manufacturer" defaultValue={initial?.manufacturer ?? ''} />
          </div>
          <div>
            <label htmlFor="p-val" className="mb-1 block text-sm font-medium">Value</label>
            <Input id="p-val" name="value" defaultValue={initial?.value ?? ''} placeholder="10kΩ" />
          </div>
          <div>
            <label htmlFor="p-pkg" className="mb-1 block text-sm font-medium">Package</label>
            <Input id="p-pkg" name="pkg" defaultValue={initial?.pkg ?? ''} placeholder="0805" />
          </div>
          <div>
            <label htmlFor="p-loc" className="mb-1 block text-sm font-medium">Location</label>
            <Input id="p-loc" name="location" defaultValue={initial?.location ?? ''} placeholder="Bin A3" />
          </div>
          <div>
            <label htmlFor="p-qty" className="mb-1 block text-sm font-medium">Quantity</label>
            <Input id="p-qty" name="qty" type="number" min={0} defaultValue={initial?.qty ?? 0} />
          </div>
          <div>
            <label htmlFor="p-min" className="mb-1 block text-sm font-medium">Low-stock at</label>
            <Input id="p-min" name="minQty" type="number" min={0} defaultValue={initial?.minQty ?? 0} />
          </div>
        </div>
        <div>
          <label htmlFor="p-notes" className="mb-1 block text-sm font-medium">Notes</label>
          <Textarea id="p-notes" name="notes" rows={2} defaultValue={initial?.notes ?? ''} />
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{initial ? 'Save' : 'Add part'}</Button>
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
