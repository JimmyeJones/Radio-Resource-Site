'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { HubItem } from '@/db/schema';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HubForm } from './hub-form';
import { deleteHubItemAction } from '@/server/actions/hub';
import { ExternalLink, Pencil, Trash2, Plus, Download, Upload } from 'lucide-react';
import { importHubAction } from '@/server/actions/hub';
import { cn } from '@/lib/cn';

interface Props { items: HubItem[] }

export function HubGrid({ items }: Props) {
  const [q, setQ] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<HubItem | null>(null);
  const [adding, setAdding] = useState(false);

  const allTags = useMemo(() => {
    const set = new Map<string, number>();
    for (const i of items) for (const t of i.tags ?? []) set.set(t, (set.get(t) ?? 0) + 1);
    return Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (activeTag && !i.tags?.includes(activeTag)) return false;
      if (!needle) return true;
      return (
        i.title.toLowerCase().includes(needle) ||
        (i.description ?? '').toLowerCase().includes(needle) ||
        i.url.toLowerCase().includes(needle) ||
        (i.tags ?? []).some((t) => t.includes(needle))
      );
    });
  }, [items, q, activeTag]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio-hub-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    const text = await file.text();
    const res = await importHubAction(text);
    if (res?.ok) alert(`Imported ${res.count} items`);
    else alert(`Import failed: ${res?.error}`);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="hub-search" className="sr-only">Search</label>
        <Input
          id="hub-search"
          type="search"
          placeholder="Search title, tag, or description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" aria-hidden /> {adding ? 'Cancel' : 'Add item'}
        </Button>
        <Button variant="secondary" onClick={exportJson} disabled={items.length === 0}>
          <Download className="h-4 w-4" aria-hidden /> Export
        </Button>
        <Button
          variant="secondary"
          onClick={() => (document.getElementById('import-file') as HTMLInputElement)?.click()}
        >
          <Upload className="h-4 w-4" aria-hidden /> Import
        </Button>
        <input
          id="import-file"
          type="file"
          accept="application/json"
          aria-label="Import hub JSON file"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await importJson(f);
            e.target.value = '';
          }}
        />
      </div>

      {adding ? (
        <Card className="mb-6">
          <CardTitle className="mb-3">New item</CardTitle>
          <HubForm onDone={() => setAdding(false)} />
        </Card>
      ) : null}

      {editing ? (
        <Card className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <CardTitle>Edit “{editing.title}”</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Close</Button>
          </div>
          <HubForm initial={editing} onDone={() => setEditing(null)} />
        </Card>
      ) : null}

      {allTags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              activeTag === null ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
            )}
          >
            All ({items.length})
          </button>
          {allTags.map(([t, n]) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag((v) => (v === t ? null : t))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                activeTag === t ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
              )}
            >
              {t} ({n})
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Card className="text-center text-muted">
          {items.length === 0 ? (
            <p>The hub is empty. Add your first link above.</p>
          ) : (
            <p>No items match the current filter.</p>
          )}
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <li key={i.id}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle>
                      <Link
                        href={i.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {i.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-0.5 truncate">
                      <a href={i.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
                        <ExternalLink className="h-3 w-3" aria-hidden />
                        {new URL(i.url).hostname}
                      </a>
                    </CardDescription>
                  </div>
                  <Badge tone="accent" className="capitalize">{i.kind}</Badge>
                </div>
                {i.description ? <p className="mt-3 line-clamp-3 text-sm text-fg/85">{i.description}</p> : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(i.tags ?? []).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <div className="mt-auto flex justify-end gap-1 pt-4">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(i)}>
                    <Pencil className="h-4 w-4" aria-hidden /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (confirm(`Delete “${i.title}”?`)) await deleteHubItemAction(i.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-danger" aria-hidden /> Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
