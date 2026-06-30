'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { reindexAll } from '@/server/search';
import { enqueueJob } from '@/server/jobs/queue';

export async function rebuildSearchIndexAction() {
  const n = reindexAll();
  return { ok: true, count: n };
}

export async function refreshSpaceWeatherAction() {
  enqueueJob({ kind: 'space_weather_refresh', payload: {} });
  return { ok: true };
}

export async function resetSetupAction() {
  db.update(settings).set({ setupComplete: false }).where(eq(settings.id, 1)).run();
  revalidatePath('/settings');
  return { ok: true };
}
