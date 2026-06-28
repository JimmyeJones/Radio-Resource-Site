'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { enqueueJob } from '@/server/jobs/queue';
import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';

const schema = z.object({ url: z.string().url() });

export async function archiveArticleAction(formData: FormData) {
  const parse = schema.safeParse({ url: String(formData.get('url') ?? '') });
  if (!parse.success) return { ok: false, error: 'Invalid URL' };
  enqueueJob({ kind: 'article_archive', payload: { url: parse.data.url } });
  revalidatePath('/library/articles');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteArticleAction(id: string) {
  const a = db.select().from(articles).where(eq(articles.id, id)).get();
  if (!a) return;
  await rm(dirname(a.htmlPath), { recursive: true, force: true }).catch(() => undefined);
  db.delete(articles).where(eq(articles.id, id)).run();
  revalidatePath('/library/articles');
}

export async function markReadAction(id: string) {
  db.update(articles)
    .set({ readAt: Math.floor(Date.now() / 1000) })
    .where(eq(articles.id, id))
    .run();
  revalidatePath('/library/articles');
}
