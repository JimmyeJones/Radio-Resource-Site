import { db } from '@/db/client';
import { spaceWeather } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { SpaceWeatherPanel } from '@/components/space-weather-panel';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function PropagationPage() {
  const sw = db.select().from(spaceWeather).where(eq(spaceWeather.id, 1)).get();
  return (
    <div>
      <PageHeader
        title="Propagation & space weather"
        description="Solar and geomagnetic indices from NOAA SWPC with a quick HF band-condition estimate."
      />
      {sw?.fetchedAt ? (
        <SpaceWeatherPanel />
      ) : (
        <Card className="text-muted">
          <p>No space-weather data yet. The worker refreshes it hourly — check back in a minute, or run a manual refresh from Settings → Maintenance.</p>
        </Card>
      )}
      <p className="mt-6 text-xs text-muted">
        Band estimates are a simplified heuristic from SFI and the K-index — not a substitute for real-time
        propagation tools. Higher solar flux opens the higher bands; an elevated K-index degrades HF,
        especially on the low bands at night.
      </p>
    </div>
  );
}
