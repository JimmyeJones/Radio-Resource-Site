import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db/client';
import { tleCache } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEFAULT_PRESETS } from '@/lib/tools/satellites';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SatellitePasses } from '@/components/satellite-passes';
import { formatRelative } from '@/lib/format';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SatelliteDetailPage({ params }: { params: { norad: string } }) {
  const norad = Number(params.norad);
  const preset = DEFAULT_PRESETS.find((p) => p.norad === norad);
  if (!preset) notFound();
  const tle = db.select().from(tleCache).where(eq(tleCache.satId, norad)).get();

  return (
    <div>
      <Link href="/tools/satellites" className="mb-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All satellites
      </Link>
      <PageHeader
        title={preset.name}
        description={preset.description}
        actions={<Badge tone="accent">{preset.group}</Badge>}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Frequencies</CardTitle>
          {preset.frequencies?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted">
                  <tr>
                    <th className="py-1 pr-3 font-semibold">Function</th>
                    <th className="py-1 pr-3 font-semibold">Downlink</th>
                    <th className="py-1 pr-3 font-semibold">Uplink</th>
                    <th className="py-1 font-semibold">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {preset.frequencies.map((f, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-1.5 pr-3">{f.label}</td>
                      <td className="py-1.5 pr-3 font-mono">{f.downlinkMHz ? `${f.downlinkMHz} MHz` : '—'}</td>
                      <td className="py-1.5 pr-3 font-mono">{f.uplinkMHz ? `${f.uplinkMHz} MHz` : '—'}</td>
                      <td className="py-1.5">{f.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">No frequency data.</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-3">Orbital data</CardTitle>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">NORAD ID</dt><dd className="font-mono">{norad}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted">TLE age</dt>
              <dd>{tle ? formatRelative(tle.fetchedAt) : 'not cached yet'}</dd>
            </div>
          </dl>
          {tle ? (
            <pre className="mt-3 overflow-x-auto rounded-md bg-elevated p-3 text-xs leading-relaxed">
              {tle.line1}
              {'\n'}
              {tle.line2}
            </pre>
          ) : null}
        </Card>
      </div>

      <SatellitePasses norad={norad} />
    </div>
  );
}
