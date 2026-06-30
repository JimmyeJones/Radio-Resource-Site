'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { hubItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { projectItems } from '@/db/schema';
import { indexHubItem, removeDoc } from '@/server/search';

const KINDS = ['channel', 'blog', 'reference', 'tool', 'podcast', 'forum', 'other'] as const;

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  url: z.string().url(),
  description: z.string().max(2000).optional().nullable(),
  kind: z.enum(KINDS),
  tags: z.string().optional().default(''),
});

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveHubItemAction(formData: FormData) {
  const parse = schema.safeParse({
    id: formData.get('id') || undefined,
    title: String(formData.get('title') ?? ''),
    url: String(formData.get('url') ?? ''),
    description: (formData.get('description') as string | null) || null,
    kind: String(formData.get('kind') ?? 'other'),
    tags: String(formData.get('tags') ?? ''),
  });
  if (!parse.success) return { ok: false, error: parse.error.issues.map((i) => i.message).join('; ') };

  const tags = parseTags(parse.data.tags ?? '');
  const id = parse.data.id ?? randomUUID();
  if (parse.data.id) {
    db.update(hubItems)
      .set({
        title: parse.data.title,
        url: parse.data.url,
        description: parse.data.description ?? null,
        kind: parse.data.kind,
        tags,
      })
      .where(eq(hubItems.id, parse.data.id))
      .run();
  } else {
    db.insert(hubItems)
      .values({
        id,
        title: parse.data.title,
        url: parse.data.url,
        description: parse.data.description ?? null,
        kind: parse.data.kind,
        tags,
      })
      .run();
  }
  indexHubItem(id);
  revalidatePath('/hub');
  return { ok: true };
}

export async function deleteHubItemAction(id: string) {
  db.delete(projectItems).where(eq(projectItems.itemId, id)).run();
  db.delete(hubItems).where(eq(hubItems.id, id)).run();
  removeDoc('hub', id);
  revalidatePath('/hub');
}

export async function fetchUrlMetadata(url: string): Promise<{ title?: string; description?: string; siteName?: string }> {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'RadioResourceSite/1.0' } });
    if (!res.ok) return {};
    const html = await res.text();
    const head = html.slice(0, 200_000);
    const title =
      head.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] ??
      head.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description =
      head.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] ??
      head.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    const siteName = head.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i)?.[1];
    return { title, description, siteName };
  } catch {
    return {};
  }
}

export async function exportHubAction() {
  const rows = db.select().from(hubItems).all();
  return rows;
}

export async function importHubAction(jsonText: string) {
  const data = JSON.parse(jsonText) as unknown;
  if (!Array.isArray(data)) return { ok: false, error: 'Expected an array' };
  let n = 0;
  for (const raw of data) {
    const item = raw as Record<string, unknown>;
    if (typeof item?.title !== 'string' || typeof item?.url !== 'string') continue;
    const kind = (typeof item.kind === 'string' && (KINDS as readonly string[]).includes(item.kind)
      ? (item.kind as (typeof KINDS)[number])
      : 'other');
    const newId = randomUUID();
    db.insert(hubItems)
      .values({
        id: newId,
        title: item.title,
        url: item.url,
        description: typeof item.description === 'string' ? item.description : null,
        kind,
        tags: Array.isArray(item.tags) ? (item.tags as string[]).map(String) : [],
      })
      .run();
    indexHubItem(newId);
    n++;
  }
  revalidatePath('/hub');
  return { ok: true, count: n };
}
