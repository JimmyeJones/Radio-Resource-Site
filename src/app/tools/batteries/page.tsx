import { BATTERY_CHEMISTRIES, PACK_NOTES } from '@/lib/tools/batteries';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function BatteriesPage() {
  return (
    <div>
      <PageHeader title="Battery reference" description="Cell voltages and care notes for common chemistries." />

      <Card className="mb-6">
        <CardTitle className="mb-3">Chemistries</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Chemistry</th>
                <th className="py-1 pr-4 font-semibold">Nominal</th>
                <th className="py-1 pr-4 font-semibold">Full</th>
                <th className="py-1 pr-4 font-semibold">Empty</th>
                <th className="py-1 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {BATTERY_CHEMISTRIES.map((b) => (
                <tr key={b.name} className="border-t border-border align-top">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{b.name}</th>
                  <td className="py-1.5 pr-4 font-mono">{b.nominalV}</td>
                  <td className="py-1.5 pr-4 font-mono">{b.fullV}</td>
                  <td className="py-1.5 pr-4 font-mono">{b.emptyV}</td>
                  <td className="py-1.5 text-muted">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">Common packs</CardTitle>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PACK_NOTES.map((p) => (
            <li key={p.label} className="rounded-lg border border-border px-3 py-2 text-sm">
              <div className="font-medium">{p.label}</div>
              <div className="font-mono text-xs text-muted">{p.value}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
