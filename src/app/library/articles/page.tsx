import Link from 'next/link';
import { db } from '@/db/client';
import { articles } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { AddArticleForm } from '@/components/add-article-form';
import { JobFeed } from '@/components/job-feed';
import { formatRelative } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  const list = db.select().from(articles).orderBy(desc(articles.archivedAt)).all();

  return (
    <div>
      <PageHeader
        title="Articles"
        description="Distraction-free reader view. Pages are stored locally so they keep working offline."
      />
      <AddArticleForm />
      <JobFeed />

      {list.length === 0 ? (
        <Card className="text-center text-muted">
          <p>Nothing archived yet. Paste an article URL above.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id}>
              <Link
                href={`/library/articles/${a.id}`}
                className="group block rounded-xl border border-border bg-surface p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:border-accent/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-medium leading-snug group-hover:text-accent">
                    {a.title}
                  </h2>
                  <span className="text-xs text-muted">{formatRelative(a.archivedAt)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {a.siteName ?? new URL(a.sourceUrl).hostname}
                  {a.byline ? ` · ${a.byline}` : ''}
                  {a.wordCount ? ` · ${a.wordCount} words` : ''}
                  {a.readAt ? null : null}
                </p>
                {a.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-fg/80">{a.excerpt}</p>
                ) : null}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {a.readAt ? <Badge tone="success">Read</Badge> : null}
                  <span className="inline-flex items-center gap-1 text-muted">
                    <ExternalLink className="h-3 w-3" aria-hidden /> source
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
