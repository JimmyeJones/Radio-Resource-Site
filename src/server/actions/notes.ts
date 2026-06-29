'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { notes, projectItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { indexNote, removeDoc } from '@/server/search';

const createSchema = z.object({ title: z.string().min(1).max(200) });

export async function createNoteAction(formData: FormData) {
  const parse = createSchema.safeParse({ title: String(formData.get('title') ?? '') });
  if (!parse.success) return { ok: false, error: 'A title is required' };
  const id = randomUUID();
  db.insert(notes).values({ id, title: parse.data.title }).run();
  indexNote(id);
  revalidatePath('/notes');
  return { ok: true, id };
}

const tagSplit = (raw: string) =>
  raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 20);

export async function saveNoteAction(id: string, title: string, body: string, tags: string) {
  db.update(notes)
    .set({ title: title.trim() || 'Untitled', body, tags: tagSplit(tags), updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(notes.id, id))
    .run();
  indexNote(id);
  revalidatePath(`/notes/${id}`);
  revalidatePath('/notes');
  return { ok: true };
}

export async function deleteNoteAction(id: string) {
  db.delete(projectItems).where(eq(projectItems.itemId, id)).run();
  db.delete(notes).where(eq(notes.id, id)).run();
  removeDoc('note', id);
  revalidatePath('/notes');
}

export async function listNotesLite() {
  return db.select({ id: notes.id, name: notes.title }).from(notes).all();
}
