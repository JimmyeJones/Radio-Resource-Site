import Link from 'next/link';
import { db } from '@/db/client';
import { videos, channels } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { AddVideoForm } from '@/components/add-video-form';
import { JobFeed } from '@/components/job-feed';
import { formatDuration, formatDate } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rss } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function VideosPage() {
  const list = db.select().from(videos).orderBy(desc(videos.addedAt)).all();
  const subs = db.select().from(channels).all();

  return (
    <div>
      <PageHeader
        title="Video library"
        description="Paste a YouTube URL to download it locally. Watch ad-free, distraction-free."
      />
      <AddVideoForm />
      <JobFeed />

      {subs.length > 0 ? (
        <section aria-label="Subscriptions" className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Channels</h2>
          <ul className="flex flex-wrap gap-2">
            {subs.map((c) => (
              <li
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm"
              >
                <Rss className="h-3.5 w-3.5 text-accent" aria-hidden />
                <span>{c.name}</span>
                {c.autoDownload ? <Badge tone="success">auto</Badge> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {list.length === 0 ? (
        <Card className="text-center text-muted">
          <p>No videos yet. Paste a YouTube URL above to get started.</p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <li key={v.id}>
              <Link
                href={`/library/videos/${v.id}`}
                className="group block overflow-hidden rounded-xl border border-border bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative aspect-video w-full bg-elevated">
                  {v.thumbnailPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/thumb/${v.id}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  {v.durationS ? (
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs text-white">
                      {formatDuration(v.durationS)}
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-accent">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {v.channel ?? 'Unknown channel'}{' '}
                    {v.publishedAt ? `· ${formatDate(v.publishedAt)}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
