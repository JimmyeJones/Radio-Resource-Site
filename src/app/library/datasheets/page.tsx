import Link from 'next/link';
import { db } from '@/db/client';
import { datasheets } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { AddDatasheetForm } from '@/components/add-datasheet-form';
import { JobFeed } from '@/components/job-feed';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/lib/format';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DatasheetsPage() {
  const list = db.select().from(datasheets).orderBy(desc(datasheets.addedAt)).all();

  return (
    <div>
      <PageHeader
        title="Datasheets"
        description="Save component datasheets locally — fetch by URL or upload a PDF. Read them offline."
      />
      <AddDatasheetForm />
      <JobFeed />

      {list.length === 0 ? (
        <Card className="text-center text-muted">
          <p>No datasheets yet. Add one above.</p>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <li key={d.id}>
              <Link
                href={`/library/datasheets/${d.id}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="rounded-md bg-accent/10 p-2 text-accent">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  {!d.filePath ? <Badge tone="warning">fetching…</Badge> : null}
                </div>
                <h2 className="font-medium leading-snug group-hover:text-accent">{d.title}</h2>
                <p className="mt-1 text-xs text-muted">
                  {[d.manufacturer, d.partNumber].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="mt-auto pt-3 text-xs text-muted">added {formatRelative(d.addedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
