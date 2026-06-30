import Link from 'next/link';
import { db } from '@/db/client';
import { projects, projectItems } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewProjectForm } from '@/components/new-project-form';
import { formatRelative } from '@/lib/format';
import { FolderKanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_TONE = {
  planning: 'neutral',
  active: 'accent',
  done: 'success',
  archived: 'warning',
} as const;

export default function ProjectsPage() {
  const list = db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
  const counts = new Map<string, number>();
  for (const row of db
    .select({ projectId: projectItems.projectId, n: sql<number>`count(*)` })
    .from(projectItems)
    .groupBy(projectItems.projectId)
    .all()) {
    counts.set(row.projectId, row.n);
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Group videos, articles, links, and datasheets around what you're building."
      />
      <NewProjectForm />

      {list.length === 0 ? (
        <Card className="text-center text-muted">
          <p>No projects yet. Create one above — e.g. “L-band dish feed”.</p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="group block focus:outline-none">
                <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="rounded-md bg-accent/10 p-2 text-accent">
                      <FolderKanban className="h-5 w-5" aria-hidden />
                    </span>
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-accent">{p.name}</CardTitle>
                  {p.description ? (
                    <CardDescription className="mt-1 line-clamp-2">{p.description}</CardDescription>
                  ) : null}
                  <p className="mt-3 text-xs text-muted">
                    {counts.get(p.id) ?? 0} items · updated {formatRelative(p.updatedAt)}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
