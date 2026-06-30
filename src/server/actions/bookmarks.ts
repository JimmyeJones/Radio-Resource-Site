'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { videoBookmarks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function addBookmarkAction(videoId: string, tSeconds: number, label: string) {
  const id = randomUUID();
  db.insert(videoBookmarks)
    .values({ id, videoId, tSeconds: Math.max(0, tSeconds), label: label.trim() })
    .run();
  revalidatePath(`/library/videos/${videoId}`);
  return { ok: true, id };
}

export async function deleteBookmarkAction(id: string, videoId: string) {
  db.delete(videoBookmarks).where(eq(videoBookmarks.id, id)).run();
  revalidatePath(`/library/videos/${videoId}`);
}
