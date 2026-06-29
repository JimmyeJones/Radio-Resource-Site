import { db } from '@/db/client';
import { qsos } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Logbook } from '@/components/logbook';

export const dynamic = 'force-dynamic';

export default function LogbookPage() {
  const items = db.select().from(qsos).orderBy(desc(qsos.qsoAt)).all();
  return (
    <div>
      <PageHeader
        title="Logbook"
        description="Log your contacts with ADIF import/export. Country fills in automatically from the callsign."
      />
      <Logbook items={items} />
    </div>
  );
}
