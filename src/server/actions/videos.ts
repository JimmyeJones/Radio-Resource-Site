'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { channels, videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isYouTubeUrl, fetchInfo } from '@/server/ytdlp';
import { enqueueJob } from '@/server/jobs/queue';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';

const addSchema = z.object({ url: z.string().url() });

export async function addVideoAction(formData: FormData) {
  const parse = addSchema.safeParse({ url: String(formData.get('url') ?? '') });
  if (!parse.success) return { ok: false, error: 'Invalid URL' };
  const { url } = parse.data;
  if (!isYouTubeUrl(url)) return { ok: false, error: 'Only YouTube URLs are supported' };
  enqueueJob({ kind: 'yt_download', payload: { url } });
  revalidatePath('/library/videos');
  revalidatePath('/');
  return { ok: true };
}

const channelSchema = z.object({
  url: z.string().url(),
  autoDownload: z.coerce.boolean().default(false),
});

export async function addChannelAction(formData: FormData) {
  const parse = channelSchema.safeParse({
    url: String(formData.get('url') ?? ''),
    autoDownload: formData.get('autoDownload') === 'on',
  });
  if (!parse.success) return { ok: false, error: 'Invalid input' };

  // Channels can be referenced by handle (@name) or channel ID URL.
  // We require a UC… channel ID to subscribe to its feed — try to fetch from page info via yt-dlp.
  try {
    const info = await fetchInfo(parse.data.url);
    const ytId = (info as { channel_id?: string; uploader_id?: string }).channel_id ?? null;
    const name = info.channel ?? info.title ?? 'Channel';
    if (!ytId) return { ok: false, error: 'Could not resolve channel ID' };
    const existing = db.select().from(channels).where(eq(channels.youtubeId, ytId)).get();
    if (!existing) {
      db.insert(channels)
        .values({
          id: randomUUID(),
          youtubeId: ytId,
          name,
          rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`,
          autoDownload: parse.data.autoDownload,
        })
        .run();
    } else if (parse.data.autoDownload !== existing.autoDownload) {
      db.update(channels)
        .set({ autoDownload: parse.data.autoDownload })
        .where(eq(channels.id, existing.id))
        .run();
    }
    enqueueJob({ kind: 'channel_poll', payload: { channelId: ytId } });
    revalidatePath('/library/videos');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteVideoAction(id: string) {
  const v = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!v) return { ok: false, error: 'Not found' };
  for (const p of [v.filePath, v.thumbnailPath, v.subsPath, v.infoJsonPath]) {
    if (p) await unlink(p).catch(() => undefined);
  }
  db.delete(videos).where(eq(videos.id, id)).run();
  revalidatePath('/library/videos');
}

export async function updateProgressAction(id: string, seconds: number) {
  db.update(videos)
    .set({ progressS: Math.max(0, Math.floor(seconds)), watchedAt: Math.floor(Date.now() / 1000) })
    .where(eq(videos.id, id))
    .run();
}
