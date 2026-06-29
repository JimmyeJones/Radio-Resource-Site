import { db } from '@/db/client';
import { parts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { PartsManager } from '@/components/parts-manager';
import { listProjectsLite } from '@/server/actions/projects';

export const dynamic = 'force-dynamic';

export default async function PartsPage() {
  const items = db.select().from(parts).orderBy(desc(parts.createdAt)).all();
  const projects = await listProjectsLite();
  return (
    <div>
      <PageHeader
        title="Parts inventory"
        description="Track components you own and add them to a project's BOM. Quantities, locations, and low-stock alerts."
      />
      <PartsManager items={items} projects={projects} />
    </div>
  );
}
