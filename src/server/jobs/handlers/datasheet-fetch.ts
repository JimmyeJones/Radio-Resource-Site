import { db } from '@/db/client';
import { datasheets, type Job } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DATASHEET_DIR, ensureMediaDirs } from '@/server/paths';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import type { ProgressFn } from './index';
import { indexDatasheet } from '@/server/search';

interface Payload {
  datasheetId: string;
  url: string;
}

export async function runDatasheetFetch(job: Job, onProgress: ProgressFn) {
  ensureMediaDirs();
  const { datasheetId, url } = job.payload as unknown as Payload;
  onProgress(10, `fetching ${url}`);

  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'RadioResourceSite/1.0', accept: 'application/pdf,*/*' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching datasheet`);
  const ct = res.headers.get('content-type') ?? '';
  const buf = Buffer.from(await res.arrayBuffer());
  // Guard against accidentally saving an HTML error page as a "PDF".
  const looksPdf = ct.includes('pdf') || buf.subarray(0, 5).toString('latin1') === '%PDF-';
  if (!looksPdf) throw new Error(`That URL did not return a PDF (got ${ct || 'unknown type'})`);

  onProgress(80, 'saving');
  const filePath = join(DATASHEET_DIR, `${datasheetId}.pdf`);
  writeFileSync(filePath, buf);
  db.update(datasheets).set({ filePath }).where(eq(datasheets.id, datasheetId)).run();
  indexDatasheet(datasheetId);
  onProgress(100, `saved ${(buf.length / 1e6).toFixed(2)} MB`);
}
