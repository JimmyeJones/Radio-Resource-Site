'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Video } from '@/db/schema';
import { formatDuration, formatDate } from '@/lib/format';
import { topicLabel } from '@/lib/topics';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { Clock, Check } from 'lucide-react';
import { toggleWatchLaterAction } from '@/server/actions/videos';

export function VideoLibrary({ videos, queueOnly = false }: { videos: Video[]; queueOnly?: boolean }) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const topicCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of videos) for (const t of v.topics ?? []) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [videos]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return videos.filter((v) => {
      if (topic && !(v.topics ?? []).includes(topic)) return false;
      if (!needle) return true;
      return (
        v.title.toLowerCase().includes(needle) ||
        (v.channel ?? '').toLowerCase().includes(needle) ||
        (v.description ?? '').toLowerCase().includes(needle)
      );
    });
  }, [videos, q, topic]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="vid-search" className="sr-only">
          Search videos
        </label>
        <Input
          id="vid-search"
          type="search"
          placeholder="Search title, channel, description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
      </div>

      {topicCounts.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTopic(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              topic === null ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
            )}
          >
            All ({videos.length})
          </button>
          {topicCounts.map(([t, n]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic((cur) => (cur === t ? null : t))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                topic === t ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
              )}
            >
              {topicLabel(t)} ({n})
            </button>
          ))}
        </div>
      ) : null}

      <div role="status" aria-live="polite" className="sr-only">
        {filtered.length} videos
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center text-muted">
          <p>{queueOnly ? 'Your watch-later queue is empty.' : 'No videos match the current filter.'}</p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <li key={v.id} className="group relative">
              <Link
                href={`/library/videos/${v.id}`}
                className="block overflow-hidden rounded-xl border border-border bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative aspect-video w-full bg-elevated">
                  {v.thumbnailPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/thumb/${v.id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                  {v.durationS ? (
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs text-white">
                      {formatDuration(v.durationS)}
                    </span>
                  ) : null}
                  {v.watchedAt ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-success/90 px-1.5 py-0.5 text-xs text-white">
                      <Check className="h-3 w-3" aria-hidden /> watched
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-accent">{v.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {v.channel ?? 'Unknown channel'} {v.publishedAt ? `· ${formatDate(v.publishedAt)}` : ''}
                  </p>
                  {(v.topics ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(v.topics ?? []).slice(0, 3).map((t) => (
                        <Badge key={t}>{topicLabel(t)}</Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
              <button
                type="button"
                aria-pressed={v.watchLater}
                aria-label={v.watchLater ? 'Remove from watch later' : 'Add to watch later'}
                disabled={pending}
                onClick={() => start(() => void toggleWatchLaterAction(v.id))}
                className={cn(
                  'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors',
                  v.watchLater
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-border bg-surface/90 text-fg hover:bg-elevated',
                )}
              >
                <Clock className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
