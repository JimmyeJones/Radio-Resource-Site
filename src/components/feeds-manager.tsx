'use client';
import { useState, useTransition } from 'react';
import type { Feed, FeedItem } from '@/db/schema';
import { addFeedAction, deleteFeedAction, pollFeedsAction } from '@/server/actions/feeds';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/lib/format';
import { Plus, Trash2, RefreshCcw, ExternalLink, Rss } from 'lucide-react';

export function FeedsManager({ feeds, recent }: { feeds: Feed[]; recent: (FeedItem & { feedTitle: string })[] }) {
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<'blog' | 'podcast'>('blog');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" aria-hidden /> {adding ? 'Cancel' : 'Add feed'}
        </Button>
        <Button variant="secondary" disabled={pending || feeds.length === 0} onClick={() => start(() => void pollFeedsAction())}>
          <RefreshCcw className="h-4 w-4" aria-hidden /> Poll now
        </Button>
      </div>

      {adding ? (
        <Card className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              start(async () => {
                const res = await addFeedAction(fd);
                if (res?.ok) setAdding(false);
                else setError(res?.error ?? 'Failed');
              });
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="feed-url" className="mb-1 block text-sm font-medium">Feed URL (RSS/Atom)</label>
                <Input id="feed-url" name="url" type="url" required placeholder="https://blog.example.com/feed.xml" />
              </div>
              <div>
                <label htmlFor="feed-kind" className="mb-1 block text-sm font-medium">Kind</label>
                <Select id="feed-kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as 'blog' | 'podcast')}>
                  <option value="blog">Blog</option>
                  <option value="podcast">Podcast</option>
                </Select>
              </div>
              {kind === 'blog' ? (
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="autoArchive" defaultChecked className="h-4 w-4 accent-accent" />
                    Auto-archive new posts to the reader
                  </label>
                </div>
              ) : null}
            </div>
            {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={pending}>Subscribe</Button>
          </form>
        </Card>
      ) : null}

      {feeds.length === 0 ? (
        <Card className="text-center text-muted"><p>No feeds yet. Subscribe to a blog or podcast above.</p></Card>
      ) : (
        <ul className="mb-8 space-y-2">
          {feeds.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <Rss className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{f.title}</span>
                  <Badge>{f.kind}</Badge>
                  {f.kind === 'blog' && f.autoArchive ? <Badge tone="success">auto-archive</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted">
                  {f.url}{f.lastPolledAt ? ` · polled ${formatRelative(f.lastPolledAt)}` : ' · not polled yet'}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Unsubscribe from ${f.title}`}
                onClick={() => { if (confirm(`Unsubscribe from ${f.title}?`)) start(() => void deleteFeedAction(f.id)); }}
                className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-elevated"
              >
                <Trash2 className="h-4 w-4 text-danger" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {recent.length > 0 ? (
        <section>
          <CardTitle className="mb-3">Recent items</CardTitle>
          <ul className="space-y-1.5">
            {recent.map((it) => (
              <li key={it.id} className="flex items-baseline justify-between gap-2 text-sm">
                <a href={it.url ?? '#'} target="_blank" rel="noopener noreferrer" className="truncate hover:text-accent">
                  {it.url ? <ExternalLink className="mr-1 inline h-3 w-3" aria-hidden /> : null}
                  {it.title}
                </a>
                <span className="shrink-0 text-xs text-muted">{it.feedTitle}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
