import { db } from '@/db/client';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';

// A video counts as "watched" once the viewer reaches ~90% of its duration.
// Saving resume position alone must NOT mark it watched, otherwise it would
// vanish from the watch-later queue after a few seconds of playback.
const WATCHED_FRACTION = 0.9;

export function saveProgress(id: string, seconds: number): void {
  const progressS = Math.max(0, Math.floor(seconds));
  const v = db.select({ durationS: videos.durationS, watchedAt: videos.watchedAt }).from(videos).where(eq(videos.id, id)).get();
  if (!v) return;
  const reachedEnd = v.durationS ? progressS >= v.durationS * WATCHED_FRACTION : false;
  db.update(videos)
    .set({ progressS, watchedAt: reachedEnd ? Math.floor(Date.now() / 1000) : v.watchedAt })
    .where(eq(videos.id, id))
    .run();
}
