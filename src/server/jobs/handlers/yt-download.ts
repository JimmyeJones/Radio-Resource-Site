import { db } from '@/db/client';
import { videos, settings as settingsTbl, type Job } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { downloadVideo } from '@/server/ytdlp';
import { ensureMediaDirs, YT_DIR } from '@/server/paths';
import { randomUUID } from 'node:crypto';
import type { ProgressFn } from './index';
import { statSync } from 'node:fs';
import { classify } from '@/lib/topics';
import { indexVideo } from '@/server/search';

interface Payload {
  url: string;
  videoIdHint?: string;
}

export async function runYtDownload(job: Job, onProgress: ProgressFn) {
  ensureMediaDirs();
  const payload = job.payload as unknown as Payload;
  const s = db.select().from(settingsTbl).where(eq(settingsTbl.id, 1)).get();

  onProgress(1, 'starting yt-dlp');
  const res = await downloadVideo({
    url: payload.url,
    outDir: YT_DIR,
    maxHeight: s?.maxHeight ?? 1080,
    subsLang: s?.defaultSubsLang ?? 'en',
    onProgress,
  });

  const ytId = res.info.id || extractYtId(payload.url) || randomUUID();
  const existing = db.select().from(videos).where(eq(videos.youtubeId, ytId)).get();
  const id = existing?.id ?? randomUUID();
  const publishedAt = res.info.upload_date
    ? Math.floor(new Date(`${res.info.upload_date.slice(0, 4)}-${res.info.upload_date.slice(4, 6)}-${res.info.upload_date.slice(6, 8)}`).getTime() / 1000)
    : null;

  let sizeBytes = 0;
  try { sizeBytes = statSync(res.filePath).size; } catch { /* noop */ }

  const topics = classify(res.info.title, res.info.description, res.info.channel);

  const row = {
    id,
    youtubeId: ytId,
    title: res.info.title ?? 'Untitled',
    channel: res.info.channel ?? null,
    channelId: res.info.channel_id ?? null,
    description: res.info.description ?? null,
    durationS: res.info.duration ?? null,
    publishedAt,
    filePath: res.filePath,
    thumbnailPath: res.thumbPath ?? null,
    subsPath: res.subsPath ?? null,
    infoJsonPath: res.infoJsonPath ?? null,
    // Preserve manual topics on re-download; only classify on first insert.
    ...(existing ? {} : { topics }),
  } satisfies Partial<typeof videos.$inferInsert> as typeof videos.$inferInsert;

  if (existing) {
    db.update(videos).set(row).where(eq(videos.id, id)).run();
  } else {
    db.insert(videos).values(row).run();
  }
  indexVideo(id);
  onProgress(100, `saved ${(sizeBytes / 1e6).toFixed(1)} MB`);
}

function extractYtId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    const v = u.searchParams.get('v');
    if (v) return v;
    const m = u.pathname.match(/\/shorts\/([\w-]{6,})/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}
