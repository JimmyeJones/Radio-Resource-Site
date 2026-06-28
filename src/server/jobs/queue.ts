import { db } from '@/db/client';
import { jobs, type Job } from '@/db/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export type JobKind = Job['kind'];

export interface EnqueueArgs<Payload extends Record<string, unknown>> {
  kind: JobKind;
  payload: Payload;
  maxAttempts?: number;
}

export function enqueueJob<P extends Record<string, unknown>>(args: EnqueueArgs<P>) {
  const id = randomUUID();
  db.insert(jobs)
    .values({
      id,
      kind: args.kind,
      payload: args.payload,
      maxAttempts: args.maxAttempts ?? 3,
      status: 'queued',
    })
    .run();
  return id;
}

export function claimNextJob(): Job | null {
  const next = db
    .select()
    .from(jobs)
    .where(eq(jobs.status, 'queued'))
    .orderBy(asc(jobs.createdAt))
    .limit(1)
    .all();
  const job = next[0];
  if (!job) return null;
  const updated = db
    .update(jobs)
    .set({
      status: 'running',
      startedAt: Math.floor(Date.now() / 1000),
      attempts: job.attempts + 1,
    })
    .where(and(eq(jobs.id, job.id), eq(jobs.status, 'queued')))
    .run();
  if (updated.changes === 0) return null;
  return { ...job, status: 'running', attempts: job.attempts + 1 };
}

export function updateJobProgress(id: string, progress: number, message?: string) {
  db.update(jobs)
    .set({ progress: Math.max(0, Math.min(100, progress)), message })
    .where(eq(jobs.id, id))
    .run();
}

export function completeJob(id: string) {
  db.update(jobs)
    .set({
      status: 'completed',
      progress: 100,
      finishedAt: Math.floor(Date.now() / 1000),
      error: null,
    })
    .where(eq(jobs.id, id))
    .run();
}

export function failJob(id: string, err: unknown, retry: boolean) {
  const message = err instanceof Error ? err.message : String(err);
  db.update(jobs)
    .set({
      status: retry ? 'queued' : 'failed',
      finishedAt: retry ? null : Math.floor(Date.now() / 1000),
      error: message.slice(0, 2000),
    })
    .where(eq(jobs.id, id))
    .run();
}

export function listJobs(limit = 50) {
  return db.select().from(jobs).orderBy(sql`created_at DESC`).limit(limit).all();
}

export function recentActive(limit = 8) {
  return db
    .select()
    .from(jobs)
    .where(sql`status in ('queued','running','failed')`)
    .orderBy(sql`created_at DESC`)
    .limit(limit)
    .all();
}
