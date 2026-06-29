import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db/client';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getProjectItems } from '@/server/actions/projects';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { ProjectNotes } from '@/components/project-notes';
import { ProjectControls } from '@/components/project-controls';
import { UnlinkButton } from '@/components/unlink-button';
import { Video, Newspaper, BookmarkPlus, FileText, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TYPE_META = {
  video: { label: 'Videos', Icon: Video },
  article: { label: 'Articles', Icon: Newspaper },
  hub: { label: 'Links', Icon: BookmarkPlus },
  datasheet: { label: 'Datasheets', Icon: FileText },
} as const;

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const p = db.select().from(projects).where(eq(projects.id, params.id)).get();
  if (!p) notFound();
  const items = await getProjectItems(p.id);

  const groups = (['video', 'article', 'hub', 'datasheet'] as const).map((t) => ({
    type: t,
    ...TYPE_META[t],
    rows: items.filter((i) => i.itemType === t),
  }));

  return (
    <div>
      <PageHeader title={p.name} description={p.description ?? undefined} />
      <ProjectControls id={p.id} name={p.name} description={p.description} status={p.status} />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <section aria-label="Linked items" className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Linked items</h2>
          {items.length === 0 ? (
            <Card className="text-muted">
              <p>Nothing linked yet. Use “Add to project” on any video, article, hub link, or datasheet.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {groups
                .filter((g) => g.rows.length > 0)
                .map(({ type, label, Icon, rows }) => (
                  <div key={type}>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
                      <Icon className="h-4 w-4" aria-hidden /> {label} ({rows.length})
                    </h3>
                    <ul className="space-y-2">
                      {rows.map((r) => (
                        <li
                          key={r.linkId}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                        >
                          <Link
                            href={r.href}
                            className="flex-1 truncate text-sm hover:text-accent"
                            {...(r.itemType === 'hub' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {r.title}
                            {r.itemType === 'hub' ? (
                              <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden />
                            ) : null}
                          </Link>
                          <UnlinkButton linkId={r.linkId} projectId={p.id} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section aria-label="Notes">
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <ProjectNotes id={p.id} initial={p.notes} />
        </section>
      </div>
    </div>
  );
}
