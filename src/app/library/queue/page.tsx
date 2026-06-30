import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { and, eq, isNull, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { VideoLibrary } from '@/components/video-library';

export const dynamic = 'force-dynamic';

export default function QueuePage() {
  // Watch-later items you haven't watched yet, newest first.
  const list = db
    .select()
    .from(videos)
    .where(and(eq(videos.watchLater, true), isNull(videos.watchedAt)))
    .orderBy(desc(videos.addedAt))
    .all();

  return (
    <div>
      <PageHeader
        title="Watch later"
        description="Videos you've queued up. They drop off once you start watching them."
      />
      <VideoLibrary videos={list} queueOnly />
    </div>
  );
}
