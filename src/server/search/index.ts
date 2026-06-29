import { rawDb, db } from '@/db/client';
import { videos, articles, hubItems, datasheets, projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';

export type DocType = 'video' | 'article' | 'hub' | 'datasheet' | 'project';

export interface SearchHit {
  docType: DocType;
  docId: string;
  url: string;
  title: string;
  snippet: string;
}

function upsert(docType: DocType, docId: string, url: string, title: string, body: string) {
  rawDb.prepare('DELETE FROM search_index WHERE doc_type = ? AND doc_id = ?').run(docType, docId);
  rawDb
    .prepare('INSERT INTO search_index (doc_type, doc_id, url, title, body) VALUES (?,?,?,?,?)')
    .run(docType, docId, url, title, body);
}

export function removeDoc(docType: DocType, docId: string) {
  rawDb.prepare('DELETE FROM search_index WHERE doc_type = ? AND doc_id = ?').run(docType, docId);
}

/** Strip WebVTT cues/timestamps to plain transcript text. */
export function vttToText(vttPath: string): string {
  let raw = '';
  try {
    raw = readFileSync(vttPath, 'utf8');
  } catch {
    return '';
  }
  const lines = raw.split(/\r?\n/);
  const out: string[] = [];
  let prev = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t || t === 'WEBVTT' || t.startsWith('NOTE') || t.includes('-->') || /^\d+$/.test(t)) continue;
    const clean = t.replace(/<[^>]+>/g, '').trim();
    if (clean && clean !== prev) {
      out.push(clean);
      prev = clean;
    }
  }
  return out.join(' ');
}

export function indexVideo(id: string) {
  const v = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!v) return;
  const transcript = v.subsPath ? vttToText(v.subsPath) : '';
  const body = [v.channel, v.description, (v.topics ?? []).join(' '), transcript]
    .filter(Boolean)
    .join('\n');
  upsert('video', id, `/library/videos/${id}`, v.title, body);
}

export function indexArticle(id: string) {
  const a = db.select().from(articles).where(eq(articles.id, id)).get();
  if (!a) return;
  let text = '';
  if (a.htmlPath) {
    try {
      text = readFileSync(a.htmlPath, 'utf8').replace(/<[^>]+>/g, ' ');
    } catch {
      /* noop */
    }
  }
  const body = [a.siteName, a.byline, a.excerpt, text].filter(Boolean).join('\n');
  upsert('article', id, `/library/articles/${id}`, a.title, body);
}

export function indexHubItem(id: string) {
  const h = db.select().from(hubItems).where(eq(hubItems.id, id)).get();
  if (!h) return;
  const body = [h.url, h.kind, (h.tags ?? []).join(' '), h.description].filter(Boolean).join('\n');
  upsert('hub', id, h.url, h.title, body);
}

export function indexDatasheet(id: string) {
  const d = db.select().from(datasheets).where(eq(datasheets.id, id)).get();
  if (!d) return;
  const body = [d.partNumber, d.manufacturer, d.notes, d.sourceUrl].filter(Boolean).join('\n');
  upsert('datasheet', id, `/library/datasheets/${id}`, d.title, body);
}

export function indexProject(id: string) {
  const p = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!p) return;
  const body = [p.description, p.status, p.notes].filter(Boolean).join('\n');
  upsert('project', id, `/projects/${id}`, p.name, body);
}

export function reindexAll(): number {
  rawDb.exec('DELETE FROM search_index');
  let n = 0;
  for (const v of db.select().from(videos).all()) { indexVideo(v.id); n++; }
  for (const a of db.select().from(articles).all()) { indexArticle(a.id); n++; }
  for (const h of db.select().from(hubItems).all()) { indexHubItem(h.id); n++; }
  for (const d of db.select().from(datasheets).all()) { indexDatasheet(d.id); n++; }
  for (const p of db.select().from(projects).all()) { indexProject(p.id); n++; }
  return n;
}

export function searchIndexCount(): number {
  const row = rawDb.prepare('SELECT count(*) AS n FROM search_index').get() as { n: number };
  return row?.n ?? 0;
}

export function search(query: string, limit = 50): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const match = ftsQuery(q);
  if (!match) return [];
  try {
    const rows = rawDb
      .prepare(
        `SELECT doc_type AS docType, doc_id AS docId, url, title,
                snippet(search_index, 4, '[', ']', ' … ', 12) AS snippet
         FROM search_index
         WHERE search_index MATCH ?
         ORDER BY bm25(search_index, 5.0, 1.0)
         LIMIT ?`,
      )
      .all(match, limit) as SearchHit[];
    return rows;
  } catch {
    return [];
  }
}

// Turn a free-form query into a safe FTS5 prefix query: tokenize on
// non-word chars and append * to each term for prefix matching.
function ftsQuery(q: string): string {
  const terms = q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((t) => `"${t}"*`);
  return terms.join(' AND ');
}
