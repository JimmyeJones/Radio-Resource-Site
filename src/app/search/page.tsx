import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { search, type DocType } from '@/server/search';
import { SearchBox } from '@/components/search-box';
import { Video, Newspaper, BookmarkPlus, FileText, FolderKanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TYPE_META: Record<DocType, { label: string; Icon: typeof Video; tone: 'accent' | 'success' | 'warning' | 'neutral' }> = {
  video: { label: 'Video', Icon: Video, tone: 'accent' },
  article: { label: 'Article', Icon: Newspaper, tone: 'success' },
  hub: { label: 'Link', Icon: BookmarkPlus, tone: 'neutral' },
  datasheet: { label: 'Datasheet', Icon: FileText, tone: 'warning' },
  project: { label: 'Project', Icon: FolderKanban, tone: 'accent' },
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const results = q ? search(q) : [];

  return (
    <div>
      <PageHeader
        title="Search"
        description="Across videos (including transcripts), articles, hub links, datasheets, and projects."
      />
      <SearchBox initial={q} />

      {q ? (
        <p className="mb-4 text-sm text-muted" role="status">
          {results.length} result{results.length === 1 ? '' : 's'} for “{q}”
        </p>
      ) : (
        <p className="text-muted">Type a query above to search your whole library.</p>
      )}

      <ul className="space-y-2">
        {results.map((r) => {
          const meta = TYPE_META[r.docType];
          const Icon = meta.Icon;
          const external = r.docType === 'hub';
          return (
            <li key={`${r.docType}-${r.docId}`}>
              <Link
                href={r.url}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="mt-0.5 rounded-md bg-accent/10 p-1.5 text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.title}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </span>
                  {r.snippet ? (
                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{r.snippet}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
