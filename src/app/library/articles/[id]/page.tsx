import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { ArticleView } from '@/components/reader/article-view';

export const dynamic = 'force-dynamic';

export default function ArticlePage({ params }: { params: { id: string } }) {
  const a = db.select().from(articles).where(eq(articles.id, params.id)).get();
  if (!a) notFound();
  let html = '';
  try { html = readFileSync(a.htmlPath, 'utf8'); } catch { html = '<p>Content missing on disk.</p>'; }

  return (
    <ArticleView
      id={a.id}
      title={a.title}
      byline={a.byline}
      siteName={a.siteName}
      sourceUrl={a.sourceUrl}
      contentHtml={html}
      wordCount={a.wordCount}
      alreadyRead={Boolean(a.readAt)}
    />
  );
}
