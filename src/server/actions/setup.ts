'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { hubItems, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { SEED_CATALOG } from '@/lib/seed-catalog';
import { addChannelAction } from './videos';
import { indexHubItem } from '@/server/search';

export interface SetupSelection {
  // channel url -> { hub: add to hub, subscribe: subscribe+poll, auto: auto-download }
  channels: { url: string; name: string; topics: string[]; hub: boolean; subscribe: boolean; auto: boolean }[];
  links: { title: string; url: string; kind: string; tags: string[]; add: boolean }[];
  extraChannels: string[];
  extraLinks: { title: string; url: string }[];
}

function addHubItem(title: string, url: string, kind: string, description: string | null, tags: string[]) {
  // Skip exact-URL duplicates so re-running setup is safe.
  const existing = db.select().from(hubItems).where(eq(hubItems.url, url)).get();
  if (existing) return;
  const id = randomUUID();
  db.insert(hubItems)
    .values({
      id,
      title,
      url,
      description,
      kind: (['channel', 'blog', 'reference', 'tool', 'podcast', 'forum', 'other'].includes(kind)
        ? kind
        : 'other') as (typeof hubItems.$inferInsert)['kind'],
      tags,
    })
    .run();
  indexHubItem(id);
}

export async function completeSetupAction(selection: SetupSelection) {
  const catalogChannels = new Map(
    SEED_CATALOG.flatMap((c) => c.channels).map((ch) => [ch.url, ch]),
  );

  let hubAdded = 0;
  let subscribed = 0;
  const errors: string[] = [];

  // Curated channels
  for (const ch of selection.channels) {
    const meta = catalogChannels.get(ch.url);
    if (ch.hub) {
      addHubItem(ch.name, ch.url, 'channel', meta?.note ?? null, meta?.topics ?? []);
      hubAdded++;
    }
    if (ch.subscribe) {
      const fd = new FormData();
      fd.set('url', ch.url);
      if (ch.auto) fd.set('autoDownload', 'on');
      const res = await addChannelAction(fd);
      if (res?.ok) subscribed++;
      else errors.push(`${ch.name}: ${res?.error ?? 'failed to subscribe'}`);
    }
  }

  // Curated links
  for (const link of selection.links) {
    if (!link.add) continue;
    addHubItem(link.title, link.url, link.kind, null, link.tags);
    hubAdded++;
  }

  // User-provided extras
  for (const url of selection.extraChannels) {
    const clean = url.trim();
    if (!clean) continue;
    const fd = new FormData();
    fd.set('url', clean);
    const res = await addChannelAction(fd);
    if (res?.ok) subscribed++;
    else errors.push(`${clean}: ${res?.error ?? 'failed'}`);
  }
  for (const link of selection.extraLinks) {
    if (!link.url.trim()) continue;
    addHubItem(link.title.trim() || link.url, link.url.trim(), 'other', null, []);
    hubAdded++;
  }

  db.update(settings).set({ setupComplete: true }).where(eq(settings.id, 1)).run();
  revalidatePath('/');
  revalidatePath('/hub');
  revalidatePath('/library/videos');
  return { ok: true, hubAdded, subscribed, errors };
}

export async function skipSetupAction() {
  db.update(settings).set({ setupComplete: true }).where(eq(settings.id, 1)).run();
  revalidatePath('/');
  return { ok: true };
}
