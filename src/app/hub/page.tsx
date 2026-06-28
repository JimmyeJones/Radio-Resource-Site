import { db } from '@/db/client';
import { hubItems } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { HubGrid } from '@/components/hub-grid';

export const dynamic = 'force-dynamic';

export default function HubPage() {
  const items = db.select().from(hubItems).orderBy(desc(hubItems.createdAt)).all();
  return (
    <div>
      <PageHeader
        title="Resource hub"
        description="Your curated directory of channels, references, blogs, and tools across the radio universe."
      />
      <HubGrid items={items} />
    </div>
  );
}
