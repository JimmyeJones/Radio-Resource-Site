import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { SettingsForm } from '@/components/settings-form';
import { MaintenancePanel } from '@/components/maintenance-panel';
import { StoragePanel } from '@/components/storage-panel';
import { getStorageStats } from '@/server/actions/storage';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const s = db.select().from(settings).where(eq(settings.id, 1)).get();
  const stats = await getStorageStats();
  return (
    <div>
      <PageHeader title="Settings" description="QTH, download preferences, and reader defaults." />
      <SettingsForm initial={s ?? null} />
      <div className="mt-6 space-y-6">
        <MaintenancePanel />
        <StoragePanel stats={stats} />
      </div>
    </div>
  );
}
