import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { ArticleView } from '@/components/reader/article-view';
import { AddToProject } from '@/components/add-to-project';
import { listProjectsLite } from '@/server/actions/projects';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const a = db.select().from(articles).where(eq(articles.id, params.id)).get();
  if (!a) notFound();
  let html = '';
  try { html = readFileSync(a.htmlPath, 'utf8'); } catch { html = '<p>Content missing on disk.</p>'; }
  const projects = await listProjectsLite();

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <AddToProject itemType="article" itemId={a.id} projects={projects} />
      </div>
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
    </div>
  );
}
