import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import createDOMPurify from 'dompurify';

export interface ExtractedArticle {
  title: string;
  byline: string | null;
  content: string; // sanitized HTML
  textContent: string;
  excerpt: string | null;
  siteName: string | null;
  lang: string | null;
  wordCount: number;
}

const FETCH_HEADERS: HeadersInit = {
  'user-agent':
    'Mozilla/5.0 (compatible; RadioResourceSiteBot/1.0; +https://example.invalid/bot)',
  accept: 'text/html,application/xhtml+xml',
};

export async function fetchAndExtract(sourceUrl: string): Promise<ExtractedArticle> {
  const res = await fetch(sourceUrl, { headers: FETCH_HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${sourceUrl}`);
  const html = await res.text();
  return extract(html, sourceUrl);
}

export function extract(html: string, sourceUrl: string): ExtractedArticle {
  const dom = new JSDOM(html, { url: sourceUrl });
  const doc = dom.window.document;
  const lang = doc.documentElement.getAttribute('lang');
  const siteName = doc
    .querySelector('meta[property="og:site_name"]')
    ?.getAttribute('content')
    ?.trim() ?? null;

  const reader = new Readability(doc, { charThreshold: 250 });
  const parsed = reader.parse();
  if (!parsed) throw new Error('Could not extract readable content from this page');

  const purify = createDOMPurify(dom.window as unknown as Window & typeof globalThis);
  const cleanHtml = purify.sanitize(parsed.content ?? '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'srcset'],
  });

  const text = parsed.textContent?.trim() ?? '';
  return {
    title: parsed.title?.trim() || sourceUrl,
    byline: parsed.byline?.trim() ?? null,
    content: cleanHtml,
    textContent: text,
    excerpt: parsed.excerpt?.trim() ?? null,
    siteName,
    lang,
    wordCount: text ? text.split(/\s+/).length : 0,
  };
}
