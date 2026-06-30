import { db } from '@/db/client';
import { feeds, feedItems, articles, type Job } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { enqueueJob } from '@/server/jobs/queue';
import { randomUUID } from 'node:crypto';
import type { ProgressFn } from './index';

interface Payload {
  feedId?: string;
}

interface ParsedItem {
  guid: string;
  title: string;
  url?: string;
  audioUrl?: string;
  publishedAt?: number;
}

const tag = (block: string, name: string): string | undefined => {
  const m =
    block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')) ??
    block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)$`, 'i'));
  if (!m) return undefined;
  return decode(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim());
};

function decode(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/** Parse RSS 2.0 or Atom into items (best-effort, no XML lib). */
export function parseFeed(xml: string): { title?: string; items: ParsedItem[] } {
  const feedTitle = tag(xml.slice(0, 2000), 'title');
  const items: ParsedItem[] = [];

  const isAtom = /<entry[\s>]/i.test(xml);
  const blocks = isAtom ? xml.split(/<entry[\s>]/i).slice(1) : xml.split(/<item[\s>]/i).slice(1);

  for (const raw of blocks) {
    const block = raw.split(isAtom ? /<\/entry>/i : /<\/item>/i)[0];
    const title = tag(block, 'title') ?? '(untitled)';
    let url: string | undefined;
    if (isAtom) {
      const link = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i);
      url = link?.[1];
    } else {
      url = tag(block, 'link');
    }
    const guid = tag(block, 'guid') ?? tag(block, 'id') ?? url ?? title;
    const enclosure = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="audio[^"]*"/i);
    const dateStr = tag(block, 'pubDate') ?? tag(block, 'published') ?? tag(block, 'updated');
    const publishedAt = dateStr ? Math.floor(new Date(dateStr).getTime() / 1000) || undefined : undefined;
    items.push({ guid, title, url, audioUrl: enclosure?.[1], publishedAt });
  }
  return { title: feedTitle, items };
}

export async function runFeedPoll(job: Job, onProgress: ProgressFn) {
  const payload = job.payload as unknown as Payload;
  const targets = payload.feedId
    ? db.select().from(feeds).where(eq(feeds.id, payload.feedId)).all()
    : db.select().from(feeds).all();

  let added = 0;
  for (let i = 0; i < targets.length; i++) {
    const feed = targets[i];
    onProgress(((i + 0.1) / targets.length) * 100, `polling ${feed.title}`);
    try {
      const res = await fetch(feed.url, { headers: { 'user-agent': 'RadioResourceSite/1.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const { items } = parseFeed(xml);
      for (const item of items) {
        const exists = db
          .select()
          .from(feedItems)
          .where(and(eq(feedItems.feedId, feed.id), eq(feedItems.guid, item.guid)))
          .get();
        if (exists) continue;
        db.insert(feedItems)
          .values({
            id: randomUUID(),
            feedId: feed.id,
            guid: item.guid,
            title: item.title,
            url: item.url ?? null,
            audioUrl: item.audioUrl ?? null,
            publishedAt: item.publishedAt ?? null,
          })
          .run();
        added++;
        // Blog posts auto-archive into the reader if enabled and not already archived.
        if (feed.kind === 'blog' && feed.autoArchive && item.url) {
          const already = db.select().from(articles).where(eq(articles.sourceUrl, item.url)).get();
          if (!already) enqueueJob({ kind: 'article_archive', payload: { url: item.url } });
        }
      }
      db.update(feeds).set({ lastPolledAt: Math.floor(Date.now() / 1000) }).where(eq(feeds.id, feed.id)).run();
    } catch {
      /* skip this feed, continue */
    }
  }
  onProgress(100, `${added} new item(s)`);
}
