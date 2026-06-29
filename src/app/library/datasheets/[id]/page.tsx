import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { datasheets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToProject } from '@/components/add-to-project';
import { DeleteDatasheetButton } from '@/components/delete-datasheet-button';
import { listProjectsLite } from '@/server/actions/projects';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DatasheetPage({ params }: { params: { id: string } }) {
  const d = db.select().from(datasheets).where(eq(datasheets.id, params.id)).get();
  if (!d) notFound();
  const projects = await listProjectsLite();

  return (
    <div>
      <PageHeader
        title={d.title}
        description={[d.manufacturer, d.partNumber].filter(Boolean).join(' · ') || undefined}
        actions={
          <>
            <AddToProject itemType="datasheet" itemId={d.id} projects={projects} />
            <DeleteDatasheetButton id={d.id} />
          </>
        }
      />

      {d.sourceUrl ? (
        <a
          href={d.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent underline underline-offset-2"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Source
        </a>
      ) : null}

      {d.notes ? <p className="mb-4 max-w-3xl whitespace-pre-wrap text-sm text-fg/85">{d.notes}</p> : null}

      {d.filePath ? (
        <object
          data={`/api/datasheet/${d.id}`}
          type="application/pdf"
          className="h-[80vh] w-full rounded-xl border border-border bg-elevated"
          aria-label={`${d.title} PDF`}
        >
          <div className="p-6 text-center text-muted">
            <p>Your browser can’t display the PDF inline.</p>
            <a className="text-accent underline" href={`/api/datasheet/${d.id}`}>
              Open the PDF in a new tab
            </a>
          </div>
        </object>
      ) : (
        <Card className="text-center text-muted">
          <Badge tone="warning">Downloading…</Badge>
          <p className="mt-2">The PDF is still being fetched. Refresh in a moment.</p>
        </Card>
      )}
    </div>
  );
}
