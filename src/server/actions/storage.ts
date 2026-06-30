'use server';
import { statSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { YT_DIR, ARTICLE_DIR, DATASHEET_DIR } from '@/server/paths';
import { db, rawDb } from '@/db/client';
import { jobs } from '@/db/schema';
import { sql } from 'drizzle-orm';

function dirSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    try {
      if (entry.isDirectory()) total += dirSize(p);
      else total += statSync(p).size;
    } catch {
      /* skip */
    }
  }
  return total;
}

export interface StorageStats {
  youtube: number;
  articles: number;
  datasheets: number;
  database: number;
  failedJobs: number;
}

export async function getStorageStats(): Promise<StorageStats> {
  const dbPath = process.env.DATABASE_PATH ?? './data/app.db';
  let database = 0;
  try {
    database = statSync(dbPath).size;
  } catch {
    /* ignore */
  }
  const failed = db.select({ n: sql<number>`count(*)` }).from(jobs).where(sql`status = 'failed'`).get()?.n ?? 0;
  return {
    youtube: dirSize(YT_DIR),
    articles: dirSize(ARTICLE_DIR),
    datasheets: dirSize(DATASHEET_DIR),
    database,
    failedJobs: failed,
  };
}

export async function clearFailedJobsAction() {
  const res = rawDb.prepare("DELETE FROM jobs WHERE status = 'failed'").run();
  return { ok: true, removed: res.changes };
}

export async function clearCompletedJobsAction() {
  const res = rawDb.prepare("DELETE FROM jobs WHERE status = 'completed'").run();
  return { ok: true, removed: res.changes };
}
