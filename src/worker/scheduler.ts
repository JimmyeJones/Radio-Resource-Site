import cron from 'node-cron';
import { db } from '@/db/client';
import { channels, feeds, jobs, spaceWeather } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { enqueueJob } from '@/server/jobs/queue';

function alreadyQueued(kind: 'channel_poll' | 'tle_refresh' | 'space_weather_refresh' | 'feed_poll'): boolean {
  const row = db
    .select({ n: sql<number>`count(*)` })
    .from(jobs)
    .where(and(eq(jobs.kind, kind), sql`status in ('queued','running')`))
    .get();
  return (row?.n ?? 0) > 0;
}

export function startScheduler() {
  // Refresh TLEs daily at 04:17 UTC
  cron.schedule(
    '17 4 * * *',
    () => {
      if (!alreadyQueued('tle_refresh')) {
        enqueueJob({ kind: 'tle_refresh', payload: {} });
      }
    },
    { timezone: 'UTC' },
  );

  // Poll channels every 6 hours at :05
  cron.schedule(
    '5 */6 * * *',
    () => {
      const list = db.select().from(channels).all();
      if (list.length === 0) return;
      if (!alreadyQueued('channel_poll')) {
        enqueueJob({ kind: 'channel_poll', payload: {} });
      }
    },
    { timezone: 'UTC' },
  );

  // Refresh space weather hourly at :12
  cron.schedule(
    '12 * * * *',
    () => {
      if (!alreadyQueued('space_weather_refresh')) {
        enqueueJob({ kind: 'space_weather_refresh', payload: {} });
      }
    },
    { timezone: 'UTC' },
  );

  // Poll RSS feeds every 3 hours at :25
  cron.schedule(
    '25 */3 * * *',
    () => {
      const list = db.select().from(feeds).all();
      if (list.length === 0) return;
      if (!alreadyQueued('feed_poll')) {
        enqueueJob({ kind: 'feed_poll', payload: {} });
      }
    },
    { timezone: 'UTC' },
  );

  // On first boot: seed a TLE refresh if no jobs yet, and a space-weather pull if stale/empty.
  setTimeout(() => {
    const cnt = db.select({ n: sql<number>`count(*)` }).from(jobs).get();
    if ((cnt?.n ?? 0) === 0) {
      enqueueJob({ kind: 'tle_refresh', payload: {} });
    }
    const sw = db.select().from(spaceWeather).where(eq(spaceWeather.id, 1)).get();
    const stale = !sw?.fetchedAt || Date.now() / 1000 - sw.fetchedAt > 3600;
    if (stale && !alreadyQueued('space_weather_refresh')) {
      enqueueJob({ kind: 'space_weather_refresh', payload: {} });
    }
  }, 5000);
}
