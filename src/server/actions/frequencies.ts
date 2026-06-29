'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { frequencies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { indexFrequency, removeDoc } from '@/server/search';

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  freqMHz: z.coerce.number().positive(),
  mode: z.string().max(40).optional().nullable(),
  band: z.string().max(40).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  tags: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

function parseTags(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveFrequencyAction(formData: FormData) {
  const parse = schema.safeParse({
    id: formData.get('id') || undefined,
    name: String(formData.get('name') ?? ''),
    freqMHz: formData.get('freqMHz'),
    mode: (formData.get('mode') as string | null) || null,
    band: (formData.get('band') as string | null) || null,
    location: (formData.get('location') as string | null) || null,
    tags: String(formData.get('tags') ?? ''),
    notes: (formData.get('notes') as string | null) || null,
  });
  if (!parse.success) return { ok: false, error: 'Name and a valid frequency (MHz) are required' };

  const id = parse.data.id ?? randomUUID();
  const row = {
    name: parse.data.name,
    freqHz: Math.round(parse.data.freqMHz * 1e6),
    mode: parse.data.mode ?? null,
    band: parse.data.band ?? null,
    location: parse.data.location ?? null,
    tags: parseTags(parse.data.tags),
    notes: parse.data.notes ?? null,
  };
  if (parse.data.id) {
    db.update(frequencies).set(row).where(eq(frequencies.id, id)).run();
  } else {
    db.insert(frequencies).values({ id, ...row }).run();
  }
  indexFrequency(id);
  revalidatePath('/frequencies');
  return { ok: true, id };
}

export async function deleteFrequencyAction(id: string) {
  db.delete(frequencies).where(eq(frequencies.id, id)).run();
  removeDoc('frequency', id);
  revalidatePath('/frequencies');
}

export async function importFrequenciesAction(jsonText: string) {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (!Array.isArray(data)) return { ok: false, error: 'Expected an array' };
  let n = 0;
  for (const raw of data) {
    const item = raw as Record<string, unknown>;
    if (typeof item?.name !== 'string') continue;
    const freqHz =
      typeof item.freqHz === 'number'
        ? item.freqHz
        : typeof item.freqMHz === 'number'
          ? Math.round(item.freqMHz * 1e6)
          : null;
    if (!freqHz) continue;
    const id = randomUUID();
    db.insert(frequencies)
      .values({
        id,
        name: item.name,
        freqHz,
        mode: typeof item.mode === 'string' ? item.mode : null,
        band: typeof item.band === 'string' ? item.band : null,
        location: typeof item.location === 'string' ? item.location : null,
        tags: Array.isArray(item.tags) ? (item.tags as string[]).map(String) : [],
        notes: typeof item.notes === 'string' ? item.notes : null,
      })
      .run();
    indexFrequency(id);
    n++;
  }
  revalidatePath('/frequencies');
  return { ok: true, count: n };
}
