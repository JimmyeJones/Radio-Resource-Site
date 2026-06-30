import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { videos, videoBookmarks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { VideoPlayer } from '@/components/player/video-player';
import { TranscriptPanel } from '@/components/player/transcript-panel';
import { formatDate, formatDuration } from '@/lib/format';
import { DeleteVideoButton } from '@/components/delete-video-button';
import { TopicEditor } from '@/components/topic-editor';
import { WatchLaterButton } from '@/components/watch-later-button';
import { AddToProject } from '@/components/add-to-project';
import { listProjectsLite } from '@/server/actions/projects';

export const dynamic = 'force-dynamic';

export default async function VideoPage({ params }: { params: { id: string } }) {
  const v = db.select().from(videos).where(eq(videos.id, params.id)).get();
  if (!v) notFound();
  const projects = await listProjectsLite();
  const bookmarks = db
    .select()
    .from(videoBookmarks)
    .where(eq(videoBookmarks.videoId, v.id))
    .orderBy(asc(videoBookmarks.tSeconds))
    .all();

  return (
    <article>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <VideoPlayer
          videoId={v.id}
          hasSubs={Boolean(v.subsPath)}
          initialProgress={v.progressS}
          title={v.title}
        />
        <TranscriptPanel videoId={v.id} hasSubs={Boolean(v.subsPath)} bookmarks={bookmarks} />
      </div>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{v.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {v.channel ?? 'Unknown channel'}
            {v.publishedAt ? ` · ${formatDate(v.publishedAt)}` : ''}
            {v.durationS ? ` · ${formatDuration(v.durationS)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WatchLaterButton videoId={v.id} initial={v.watchLater} />
          <AddToProject itemType="video" itemId={v.id} projects={projects} />
          <DeleteVideoButton id={v.id} />
        </div>
      </header>

      <div className="mt-4">
        <TopicEditor videoId={v.id} initial={v.topics ?? []} />
      </div>

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
