import { db } from '@/db/client';
import { frequencies } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { FrequencyManager } from '@/components/frequency-manager';

export const dynamic = 'force-dynamic';

export default function FrequenciesPage() {
  const items = db.select().from(frequencies).orderBy(desc(frequencies.createdAt)).all();
  return (
    <div>
      <PageHeader
        title="Frequency memory"
        description="Your personal scanner/SDR bank — store, tag, and search frequencies you monitor."
      />
      <FrequencyManager items={items} />
    </div>
  );
}
