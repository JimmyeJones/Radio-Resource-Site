'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { parts, projectItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { indexPart, removeDoc } from '@/server/search';

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  partNumber: z.string().max(120).optional().nullable(),
  manufacturer: z.string().max(120).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  value: z.string().max(80).optional().nullable(),
  pkg: z.string().max(80).optional().nullable(),
  qty: z.coerce.number().int().min(0).default(0),
  minQty: z.coerce.number().int().min(0).default(0),
  location: z.string().max(120).optional().nullable(),
  datasheetId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function savePartAction(formData: FormData) {
  const parse = schema.safeParse({
    id: formData.get('id') || undefined,
    name: String(formData.get('name') ?? ''),
    partNumber: (formData.get('partNumber') as string | null) || null,
    manufacturer: (formData.get('manufacturer') as string | null) || null,
    category: (formData.get('category') as string | null) || null,
    value: (formData.get('value') as string | null) || null,
    pkg: (formData.get('pkg') as string | null) || null,
    qty: formData.get('qty') ?? 0,
    minQty: formData.get('minQty') ?? 0,
    location: (formData.get('location') as string | null) || null,
    datasheetId: (formData.get('datasheetId') as string | null) || null,
    notes: (formData.get('notes') as string | null) || null,
  });
  if (!parse.success) return { ok: false, error: 'A part name is required' };

  const id = parse.data.id ?? randomUUID();
  const { id: _omit, ...rest } = parse.data;
  void _omit;
  const row = { ...rest, datasheetId: parse.data.datasheetId ?? null };
  if (parse.data.id) {
    db.update(parts).set(row).where(eq(parts.id, id)).run();
  } else {
    db.insert(parts).values({ id, ...row }).run();
  }
  indexPart(id);
  revalidatePath('/parts');
  return { ok: true, id };
}

export async function adjustPartQtyAction(id: string, delta: number) {
  const p = db.select().from(parts).where(eq(parts.id, id)).get();
  if (!p) return;
  db.update(parts).set({ qty: Math.max(0, p.qty + delta) }).where(eq(parts.id, id)).run();
  revalidatePath('/parts');
}

export async function deletePartAction(id: string) {
  db.delete(projectItems).where(eq(projectItems.itemId, id)).run();
  db.delete(parts).where(eq(parts.id, id)).run();
  removeDoc('part', id);
  revalidatePath('/parts');
}

export async function listPartsLite() {
  return db.select({ id: parts.id, name: parts.name, partNumber: parts.partNumber }).from(parts).all();
}
