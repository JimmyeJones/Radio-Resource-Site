import { BAND_DESIGNATIONS } from '@/lib/tools/references';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';

export default function BandDesignationsPage() {
  return (
    <div>
      <PageHeader
        title="Band designations"
        description="ITU bands plus IEEE radar / microwave letter bands (L through Ka)."
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Band</th>
              <th className="px-4 py-2 font-semibold">Frequency</th>
              <th className="px-4 py-2 font-semibold">System</th>
              <th className="px-4 py-2 font-semibold">Typical use</th>
            </tr>
          </thead>
          <tbody>
            {BAND_DESIGNATIONS.map((b) => (
              <tr key={b.name} className="border-t border-border">
                <th scope="row" className="px-4 py-2 font-semibold">{b.name}</th>
                <td className="px-4 py-2 font-mono">{b.range}</td>
                <td className="px-4 py-2"><Badge>{b.system}</Badge></td>
                <td className="px-4 py-2 text-fg/85">{b.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
