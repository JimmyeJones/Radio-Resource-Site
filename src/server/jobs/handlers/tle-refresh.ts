import type { Job } from '@/db/schema';
import { refreshTleCache } from '@/server/satellites/tle';
import type { ProgressFn } from './index';

export async function runTleRefresh(_job: Job, onProgress: ProgressFn) {
  onProgress(5, 'fetching CelesTrak');
  const n = await refreshTleCache();
  onProgress(100, `cached ${n} TLEs`);
}
