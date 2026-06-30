'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { feeds, feedItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { enqueueJob } from '@/server/jobs/queue';

const schema = z.object({
  url: z.string().url(),
  title: z.string().max(200).optional(),
  kind: z.enum(['blog', 'podcast']).default('blog'),
  autoArchive: z.coerce.boolean().default(true),
});

export async function addFeedAction(formData: FormData) {
  const parse = schema.safeParse({
    url: String(formData.get('url') ?? ''),
    title: (formData.get('title') as string | null) || undefined,
    kind: (formData.get('kind') as string) || 'blog',
    autoArchive: formData.get('autoArchive') !== null,
  });
  if (!parse.success) return { ok: false, error: 'A valid feed URL is required' };

  const existing = db.select().from(feeds).where(eq(feeds.url, parse.data.url)).get();
  if (existing) return { ok: false, error: 'Already subscribed to that feed' };

  let title = parse.data.title;
  if (!title) {
    try {
      const res = await fetch(parse.data.url, { headers: { 'user-agent': 'RadioResourceSite/1.0' } });
      const xml = await res.text();
      title = xml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    } catch {
      /* ignore */
    }
  }

  const id = randomUUID();
  db.insert(feeds)
    .values({
      id,
      url: parse.data.url,
      title: title || new URL(parse.data.url).hostname,
      kind: parse.data.kind,
      autoArchive: parse.data.kind === 'blog' ? parse.data.autoArchive : false,
    })
    .run();
  enqueueJob({ kind: 'feed_poll', payload: { feedId: id } });
  revalidatePath('/feeds');
  return { ok: true, id };
}

export async function deleteFeedAction(id: string) {
  db.delete(feedItems).where(eq(feedItems.feedId, id)).run();
  db.delete(feeds).where(eq(feeds.id, id)).run();
  revalidatePath('/feeds');
}

export async function pollFeedsAction() {
  enqueueJob({ kind: 'feed_poll', payload: {} });
  revalidatePath('/feeds');
  return { ok: true };
}
