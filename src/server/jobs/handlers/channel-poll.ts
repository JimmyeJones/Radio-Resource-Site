import { db } from '@/db/client';
import { channels, videos, type Job } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { enqueueJob } from '../queue';
import type { ProgressFn } from './index';

interface Payload {
  channelId?: string;
}

const ENTRY_RE = /<entry>([\s\S]*?)<\/entry>/g;
const ID_RE = /<yt:videoId>([\w-]+)<\/yt:videoId>/;
const TITLE_RE = /<title>([\s\S]*?)<\/title>/;

export async function runChannelPoll(job: Job, onProgress: ProgressFn) {
  const payload = job.payload as unknown as Payload;
  const targets = payload.channelId
    ? db.select().from(channels).where(eq(channels.youtubeId, payload.channelId)).all()
    : db.select().from(channels).all();

  let enqueued = 0;
  for (let i = 0; i < targets.length; i++) {
    const ch = targets[i];
    onProgress(((i + 0.1) / targets.length) * 100, `polling ${ch.name}`);
    try {
      const res = await fetch(ch.rssUrl, { headers: { 'user-agent': 'RadioResourceSite/1.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      let m: RegExpExecArray | null;
      while ((m = ENTRY_RE.exec(xml)) !== null) {
        const entry = m[1];
        const idMatch = entry.match(ID_RE);
        const titleMatch = entry.match(TITLE_RE);
        if (!idMatch) continue;
        const ytId = idMatch[1];
        const exists = db.select().from(videos).where(eq(videos.youtubeId, ytId)).get();
        if (exists) continue;
        if (ch.autoDownload) {
          enqueueJob({ kind: 'yt_download', payload: { url: `https://www.youtube.com/watch?v=${ytId}` } });
          enqueued++;
        }
      }
      db.update(channels).set({ lastPolledAt: Math.floor(Date.now() / 1000) }).where(eq(channels.id, ch.id)).run();
    } catch (err) {
      // ignore individual channel errors so the rest still poll
    }
  }
  onProgress(100, `enqueued ${enqueued} new videos`);
}
