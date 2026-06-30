'use server';
import { db } from '@/db/client';
import { examAttempts } from '@/db/schema';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

export async function recordAttemptAction(pool: string, total: number, correct: number) {
  db.insert(examAttempts)
    .values({ id: randomUUID(), pool, total: Math.max(0, total), correct: Math.max(0, correct) })
    .run();
  revalidatePath('/study');
  return { ok: true };
}
