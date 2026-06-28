import { db } from '@/db/client';
import { articles, type Job } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fetchAndExtract } from '@/server/readability';
import { ARTICLE_DIR, ensureMediaDirs } from '@/server/paths';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { ProgressFn } from './index';

interface Payload {
  url: string;
}

export async function runArticleArchive(job: Job, onProgress: ProgressFn) {
  ensureMediaDirs();
  const { url } = job.payload as unknown as Payload;
  onProgress(10, `fetching ${url}`);
  const extracted = await fetchAndExtract(url);
  onProgress(70, 'rendering');

  const id = randomUUID();
  const dir = join(ARTICLE_DIR, id);
  mkdirSync(dir, { recursive: true });
  const htmlPath = join(dir, 'content.html');
  writeFileSync(htmlPath, extracted.content, 'utf8');
  writeFileSync(
    join(dir, 'meta.json'),
    JSON.stringify(
      {
        sourceUrl: url,
        title: extracted.title,
        byline: extracted.byline,
        siteName: extracted.siteName,
        excerpt: extracted.excerpt,
        lang: extracted.lang,
        wordCount: extracted.wordCount,
        archivedAt: Math.floor(Date.now() / 1000),
      },
      null,
      2,
    ),
    'utf8',
  );

  const existing = db.select().from(articles).where(eq(articles.sourceUrl, url)).get();
  const row = {
    id: existing?.id ?? id,
    sourceUrl: url,
    title: extracted.title,
    byline: extracted.byline,
    siteName: extracted.siteName,
    excerpt: extracted.excerpt,
    htmlPath,
    wordCount: extracted.wordCount,
    lang: extracted.lang,
  } satisfies Partial<typeof articles.$inferInsert> as typeof articles.$inferInsert;
  if (existing) {
    db.update(articles).set(row).where(eq(articles.id, existing.id)).run();
  } else {
    db.insert(articles).values(row).run();
  }
  onProgress(100, `saved ${extracted.wordCount} words`);
}
