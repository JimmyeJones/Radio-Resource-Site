import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { SettingsForm } from '@/components/settings-form';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const s = db.select().from(settings).where(eq(settings.id, 1)).get();
  return (
    <div>
      <PageHeader title="Settings" description="QTH, download preferences, and reader defaults." />
      <SettingsForm initial={s ?? null} />
    </div>
  );
}
