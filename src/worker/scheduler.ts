import cron from 'node-cron';
import { db } from '@/db/client';
import { channels, jobs } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { enqueueJob } from '@/server/jobs/queue';

function alreadyQueued(kind: 'channel_poll' | 'tle_refresh'): boolean {
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

  // Kick a TLE refresh on first boot if cache is empty (handled by satellites page lazily too)
  setTimeout(() => {
    const cnt = db.select({ n: sql<number>`count(*)` }).from(jobs).get();
    if ((cnt?.n ?? 0) === 0) {
      enqueueJob({ kind: 'tle_refresh', payload: {} });
    }
  }, 5000);
}
