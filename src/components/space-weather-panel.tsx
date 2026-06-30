import { db } from '@/db/client';
import { spaceWeather } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { bandConditions, CONDITION_TONE } from '@/lib/tools/propagation';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/lib/format';
import { Sun } from 'lucide-react';

export function SpaceWeatherPanel({ compact = false }: { compact?: boolean }) {
  const sw = db.select().from(spaceWeather).where(eq(spaceWeather.id, 1)).get();
  if (!sw?.fetchedAt) return null;

  const conditions = bandConditions(sw.sfi, sw.kIndex);
  const kTone = (sw.kIndex ?? 0) >= 5 ? 'danger' : (sw.kIndex ?? 0) >= 4 ? 'warning' : 'success';

  return (
    <Card className={compact ? 'mb-6' : ''}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sun className="h-4 w-4 text-accent" aria-hidden /> Space weather
        </CardTitle>
        <span className="text-xs text-muted">updated {formatRelative(sw.fetchedAt)}</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Solar flux" value={sw.sfi != null ? sw.sfi.toFixed(0) : '—'} unit="SFI" />
        <Stat label="Sunspots" value={sw.sunspots != null ? String(sw.sunspots) : '—'} />
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">K-index</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{sw.kIndex != null ? sw.kIndex.toFixed(0) : '—'}</span>
            {sw.kIndex != null ? <Badge tone={kTone}>{kTone === 'danger' ? 'storm' : kTone === 'warning' ? 'unsettled' : 'quiet'}</Badge> : null}
          </div>
        </div>
        <Stat label="A-index" value={sw.aIndex != null ? sw.aIndex.toFixed(0) : '—'} />
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-muted">HF band estimate</div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {conditions.map((c) => (
            <li key={c.band} className="rounded-lg border border-border px-3 py-2 text-sm">
              <div className="font-medium">{c.band}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge tone={CONDITION_TONE[c.day]}>day {c.day}</Badge>
                <Badge tone={CONDITION_TONE[c.night]}>night {c.night}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}
