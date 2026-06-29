'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { reindexAll } from '@/server/search';

export async function rebuildSearchIndexAction() {
  const n = reindexAll();
  return { ok: true, count: n };
}

export async function resetSetupAction() {
  db.update(settings).set({ setupComplete: false }).where(eq(settings.id, 1)).run();
  revalidatePath('/settings');
  return { ok: true };
}
