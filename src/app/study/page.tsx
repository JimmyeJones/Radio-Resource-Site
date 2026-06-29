import { db } from '@/db/client';
import { examAttempts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { StudyClient } from '@/components/study-client';
import { POOLS } from '@/lib/exam';
import { formatRelative } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function StudyPage() {
  const pool = POOLS[0];
  const attempts = db.select().from(examAttempts).orderBy(desc(examAttempts.takenAt)).limit(8).all();

  return (
    <div>
      <PageHeader title="License study" description={pool.label} />
      {pool.note ? <p className="mb-4 text-sm text-muted">{pool.note}</p> : null}

      <StudyClient pool={pool} />

      {attempts.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Recent attempts</h2>
          <ul className="space-y-2">
            {attempts.map((a) => {
              const pct = Math.round((100 * a.correct) / a.total);
              return (
                <li key={a.id}>
                  <Card className="flex items-center justify-between py-3">
                    <span className="text-sm">{a.pool} · {a.correct}/{a.total} ({pct}%)</span>
                    <span className="text-xs text-muted">{formatRelative(a.takenAt)}</span>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
