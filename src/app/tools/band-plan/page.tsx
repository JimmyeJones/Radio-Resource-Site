'use client';
import { useMemo, useState } from 'react';
import { BANDS, LICENSE_LABELS, formatFreq, type LicenseClass } from '@/lib/tools/band-plan';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

const CLASS_ORDER: LicenseClass[] = ['novice', 'technician', 'general', 'advanced', 'extra'];
const MODE_TONE: Record<string, 'accent' | 'success' | 'warning' | 'neutral'> = {
  CW: 'accent',
  Phone: 'success',
  Digital: 'warning',
  'RTTY/Data': 'warning',
  Image: 'neutral',
  'CW/Digital': 'warning',
};

export default function BandPlanPage() {
  const [filter, setFilter] = useState<LicenseClass | 'all'>('all');

  const visibleBands = useMemo(() => {
    if (filter === 'all') return BANDS;
    return BANDS.map((b) => ({
      ...b,
      segments: b.segments.filter((s) => s.classes.includes(filter)),
    })).filter((b) => b.segments.length > 0);
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="US Amateur Band Plan"
        description="Hover or focus a segment for details. Filter by license class to see what you can operate."
      />

      <fieldset className="mb-6">
        <legend className="sr-only">Filter by license class</legend>
        <div role="radiogroup" aria-label="License class filter" className="flex flex-wrap gap-2">
          {(['all', ...CLASS_ORDER] as const).map((cls) => (
            <button
              key={cls}
              role="radio"
              aria-checked={filter === cls}
              onClick={() => setFilter(cls)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                filter === cls
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-border bg-surface hover:bg-elevated',
              )}
            >
              {cls === 'all' ? 'All classes' : LICENSE_LABELS[cls]}
            </button>
          ))}
        </div>
      </fieldset>

      <ul className="space-y-4">
        {visibleBands.map((band) => {
          const span = band.endKHz - band.startKHz;
          return (
            <li key={band.name}>
              <Card>
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <CardTitle>{band.name}</CardTitle>
                  <CardDescription className="font-mono">
                    {formatFreq(band.startKHz)} – {formatFreq(band.endKHz)}
                  </CardDescription>
                </div>
                <div className="relative h-12 overflow-hidden rounded-md border border-border bg-elevated">
                  {band.segments.map((seg, i) => {
                    const left = ((seg.startKHz - band.startKHz) / span) * 100;
                    const width = ((seg.endKHz - seg.startKHz) / span) * 100;
                    const tone = MODE_TONE[seg.modes[0]] ?? 'neutral';
                    const toneClasses =
                      tone === 'accent'
                        ? 'bg-accent/30 ring-accent'
                        : tone === 'success'
                          ? 'bg-success/30 ring-success'
                          : tone === 'warning'
                            ? 'bg-warning/30 ring-warning'
                            : 'bg-muted/30 ring-muted';
                    return (
                      <button
                        key={i}
                        type="button"
                        title={`${formatFreq(seg.startKHz)} – ${formatFreq(seg.endKHz)} · ${seg.modes.join(', ')}`}
                        className={cn(
                          'absolute inset-y-0 ring-inset ring-1 transition hover:brightness-110 focus:z-10',
                          toneClasses,
                        )}
                        style={{ left: `${left}%`, width: `${Math.max(width, 0.6)}%` }}
                        aria-label={`${seg.modes.join(', ')} from ${formatFreq(seg.startKHz)} to ${formatFreq(seg.endKHz)} for ${seg.classes.map((c) => LICENSE_LABELS[c]).join(', ')}`}
                      />
                    );
                  })}
                </div>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {band.segments.map((seg, i) => (
                    <li
                      key={i}
                      className="flex flex-col gap-1 rounded-md border border-border bg-surface px-3 py-2"
                    >
                      <span className="font-mono text-xs text-muted">
                        {formatFreq(seg.startKHz)} – {formatFreq(seg.endKHz)}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {seg.modes.map((m) => (
                          <Badge key={m} tone={MODE_TONE[m] ?? 'neutral'}>
                            {m}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {seg.classes.map((c) => (
                          <Badge key={c}>{LICENSE_LABELS[c]}</Badge>
                        ))}
                      </div>
                      {seg.note ? <p className="text-xs text-muted">{seg.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs text-muted">
        Summary derived from FCC Part 97 / ARRL band charts. Always verify current regulations
        before transmitting.
      </p>
    </div>
  );
}
