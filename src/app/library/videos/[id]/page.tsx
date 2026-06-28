import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { VideoPlayer } from '@/components/player/video-player';
import { formatDate, formatDuration } from '@/lib/format';
import { DeleteVideoButton } from '@/components/delete-video-button';

export const dynamic = 'force-dynamic';

export default function VideoPage({ params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v) notFound();

  return (
    <article>
      <VideoPlayer
        videoId={v.id}
        hasSubs={Boolean(v.subsPath)}
        initialProgress={v.progressS}
        title={v.title}
      />

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{v.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {v.channel ?? 'Unknown channel'}
            {v.publishedAt ? ` · ${formatDate(v.publishedAt)}` : ''}
            {v.durationS ? ` · ${formatDuration(v.durationS)}` : ''}
          </p>
        </div>
        <DeleteVideoButton id={v.id} />
      </header>

      <details className="mt-6 rounded-xl border border-border bg-surface p-4">
        <summary className="cursor-pointer font-medium">Keyboard shortcuts</summary>
        <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          <dt className="font-mono">Space / K</dt><dd>Play / pause</dd>
          <dt className="font-mono">← / →</dt><dd>Seek ±5 s</dd>
          <dt className="font-mono">↑ / ↓</dt><dd>Volume ±10%</dd>
          <dt className="font-mono">M</dt><dd>Mute</dd>
          <dt className="font-mono">C</dt><dd>Toggle captions</dd>
          <dt className="font-mono">F</dt><dd>Fullscreen</dd>
        </dl>
      </details>

      {v.description ? (
        <section className="mt-6 max-w-3xl">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-fg/85">{v.description}</p>
        </section>
      ) : null}
    </article>
  );
}
