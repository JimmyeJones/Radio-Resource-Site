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
  partNumber: string;
}

const UA = 'Mozilla/5.0 (compatible; RadioResourceSiteBot/1.0)';

/**
 * Best-effort datasheet lookup by part number. There is no clean free API, so
 * this scrapes a DuckDuckGo HTML search for a PDF link. On failure it records a
 * human search URL on the datasheet so the user can finish manually — it never
 * leaves the job retrying forever.
 */
export async function runDatasheetLookup(job: Job, onProgress: ProgressFn) {
  ensureMediaDirs();
  const { datasheetId, partNumber } = job.payload as unknown as Payload;
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(`${partNumber} datasheet pdf`)}`;

  onProgress(15, `searching for ${partNumber}`);
  const pdfUrl = await findPdfUrl(partNumber).catch(() => null);

  if (pdfUrl) {
    onProgress(55, 'downloading PDF');
    try {
      const res = await fetch(pdfUrl, { headers: { 'user-agent': UA, accept: 'application/pdf,*/*' }, redirect: 'follow' });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.subarray(0, 5).toString('latin1') === '%PDF-') {
          const filePath = join(DATASHEET_DIR, `${datasheetId}.pdf`);
          writeFileSync(filePath, buf);
          db.update(datasheets).set({ filePath, sourceUrl: pdfUrl }).where(eq(datasheets.id, datasheetId)).run();
          indexDatasheet(datasheetId);
          onProgress(100, `found ${(buf.length / 1e6).toFixed(2)} MB`);
          return;
        }
      }
    } catch {
      /* fall through to manual */
    }
  }

  // Couldn't auto-fetch — leave a search link and a clear note.
  db.update(datasheets)
    .set({
      sourceUrl: searchUrl,
      notes: `Auto-fetch couldn't find a PDF for "${partNumber}". Use the Source link to search, then add the PDF URL or upload manually.`,
    })
    .where(eq(datasheets.id, datasheetId))
    .run();
  indexDatasheet(datasheetId);
  onProgress(100, 'no PDF found — search link saved');
}

async function findPdfUrl(partNumber: string): Promise<string | null> {
  const q = encodeURIComponent(`${partNumber} datasheet filetype:pdf`);
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
    headers: { 'user-agent': UA, accept: 'text/html' },
  });
  if (!res.ok) return null;
  const html = await res.text();
  // DDG HTML wraps real URLs in a redirect; pull uddg= targets and decode.
  const candidates: string[] = [];
  const re = /uddg=([^"&]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      candidates.push(decodeURIComponent(m[1]));
    } catch {
      /* skip */
    }
  }
  return candidates.find((u) => /\.pdf($|\?)/i.test(u)) ?? null;
}
