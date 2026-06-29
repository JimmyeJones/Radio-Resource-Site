'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { datasheets, projectItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { enqueueJob } from '@/server/jobs/queue';
import { DATASHEET_DIR, ensureMediaDirs } from '@/server/paths';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { indexDatasheet, removeDoc } from '@/server/search';

const metaSchema = z.object({
  title: z.string().min(1).max(200),
  partNumber: z.string().max(120).optional().nullable(),
  manufacturer: z.string().max(120).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

function readMeta(formData: FormData) {
  return metaSchema.safeParse({
    title: String(formData.get('title') ?? '').trim(),
    partNumber: (formData.get('partNumber') as string | null) || null,
    manufacturer: (formData.get('manufacturer') as string | null) || null,
    notes: (formData.get('notes') as string | null) || null,
  });
}

/** Add a datasheet by URL — the worker downloads the PDF in the background. */
export async function addDatasheetUrlAction(formData: FormData) {
  const parsed = readMeta(formData);
  const url = String(formData.get('url') ?? '').trim();
  if (!parsed.success) return { ok: false, error: 'A title is required' };
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: 'A valid http(s) URL is required' };

  const id = randomUUID();
  db.insert(datasheets)
    .values({
      id,
      title: parsed.data.title,
      partNumber: parsed.data.partNumber ?? null,
      manufacturer: parsed.data.manufacturer ?? null,
      sourceUrl: url,
      notes: parsed.data.notes ?? null,
    })
    .run();
  indexDatasheet(id);
  enqueueJob({ kind: 'datasheet_fetch', payload: { datasheetId: id, url } });
  revalidatePath('/library/datasheets');
  return { ok: true, id };
}

/** Add a datasheet by direct PDF upload. */
export async function uploadDatasheetAction(formData: FormData) {
  const parsed = readMeta(formData);
  if (!parsed.success) return { ok: false, error: 'A title is required' };
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Choose a PDF file' };
  if (file.type && !file.type.includes('pdf')) return { ok: false, error: 'Only PDF files are supported' };

  ensureMediaDirs();
  const id = randomUUID();
  const filePath = join(DATASHEET_DIR, `${id}.pdf`);
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return { ok: false, error: 'That file does not look like a PDF' };
  }
  await writeFile(filePath, buf);

  db.insert(datasheets)
    .values({
      id,
      title: parsed.data.title,
      partNumber: parsed.data.partNumber ?? null,
      manufacturer: parsed.data.manufacturer ?? null,
      notes: parsed.data.notes ?? null,
      filePath,
    })
    .run();
  indexDatasheet(id);
  revalidatePath('/library/datasheets');
  return { ok: true, id };
}

export async function deleteDatasheetAction(id: string) {
  const d = db.select().from(datasheets).where(eq(datasheets.id, id)).get();
  if (!d) return;
  if (d.filePath) await unlink(d.filePath).catch(() => undefined);
  db.delete(projectItems).where(eq(projectItems.itemId, id)).run();
  db.delete(datasheets).where(eq(datasheets.id, id)).run();
  removeDoc('datasheet', id);
  revalidatePath('/library/datasheets');
}
