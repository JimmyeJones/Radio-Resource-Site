import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { WorldMap } from '@/components/world-map';

export const metadata: Metadata = { title: 'Live World Map' };
export const dynamic = 'force-dynamic';

export default function MapPage() {
  return (
    <div>
      <PageHeader
        title="Live world map"
        description="Day/night grey line and real-time satellite ground tracks. Set your QTH in Settings to plot your station."
      />
      <WorldMap />
      <p className="mt-4 text-xs text-muted">
        The shaded band is the grey line (twilight) — where HF propagation is often enhanced. Satellites are
        propagated live from cached TLEs; footprints show their coverage circle. See upcoming passes in the{' '}
        <Link href="/tools/satellites" className="text-accent hover:underline">satellite tool</Link>.
      </p>
    </div>
  );
}
