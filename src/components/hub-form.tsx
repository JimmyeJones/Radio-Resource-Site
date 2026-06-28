'use client';
import { useState, useTransition } from 'react';
import { saveHubItemAction, fetchUrlMetadata } from '@/server/actions/hub';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Save } from 'lucide-react';
import type { HubItem } from '@/db/schema';

const KINDS: HubItem['kind'][] = ['channel', 'blog', 'reference', 'tool', 'podcast', 'forum', 'other'];

export function HubForm({
  initial,
  onDone,
}: {
  initial?: HubItem;
  onDone?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [kind, setKind] = useState<HubItem['kind']>(initial?.kind ?? 'other');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [pending, start] = useTransition();
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enrich() {
    if (!url) return;
    setEnriching(true);
    try {
      const meta = await fetchUrlMetadata(url);
      if (meta.title && !title) setTitle(meta.title);
      if (meta.description && !description) setDescription(meta.description);
    } finally {
      setEnriching(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveHubItemAction(fd);
      if (res?.ok) {
        onDone?.();
        if (!initial) {
          setTitle(''); setUrl(''); setDescription(''); setTags(''); setKind('other');
        }
      } else {
        setError(res?.error ?? 'Failed');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div>
        <label htmlFor="hub-url" className="mb-1 block text-sm font-medium">URL</label>
        <div className="flex gap-2">
          <Input id="hub-url" name="url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button type="button" variant="secondary" onClick={enrich} disabled={!url || enriching}>
            <Sparkles className="h-4 w-4" aria-hidden />
            {enriching ? 'Reading…' : 'Fill from page'}
          </Button>
        </div>
      </div>
      <div>
        <label htmlFor="hub-title" className="mb-1 block text-sm font-medium">Title</label>
        <Input id="hub-title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hub-kind" className="mb-1 block text-sm font-medium">Kind</label>
          <Select id="hub-kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as HubItem['kind'])}>
            {KINDS.map((k) => (
              <option key={k} value={k} className="capitalize">{k}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="hub-tags" className="mb-1 block text-sm font-medium">Tags</label>
          <Input id="hub-tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ham, SDR, antennas" />
        </div>
      </div>
      <div>
        <label htmlFor="hub-desc" className="mb-1 block text-sm font-medium">Description</label>
        <Textarea id="hub-desc" name="description" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" aria-hidden />
          {initial ? 'Save changes' : 'Add to hub'}
        </Button>
      </div>
    </form>
  );
}
