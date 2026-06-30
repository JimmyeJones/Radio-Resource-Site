import { RF_CONNECTORS, PINOUTS } from '@/lib/tools/pinouts';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function PinoutsPage() {
  return (
    <div>
      <PageHeader title="Connectors & pinouts" description="RF connector quick-reference and common IC/header pinouts." />

      <Card className="mb-6">
        <CardTitle className="mb-3">RF connectors</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Connector</th>
                <th className="py-1 pr-4 font-semibold">Impedance</th>
                <th className="py-1 pr-4 font-semibold">Max freq</th>
                <th className="py-1 pr-4 font-semibold">Coupling</th>
                <th className="py-1 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {RF_CONNECTORS.map((c) => (
                <tr key={c.name} className="border-t border-border align-top">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{c.name}</th>
                  <td className="py-1.5 pr-4 font-mono">{c.impedance}</td>
                  <td className="py-1.5 pr-4 font-mono">{c.maxFreq}</td>
                  <td className="py-1.5 pr-4">{c.coupling}</td>
                  <td className="py-1.5 text-fg/85">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Pinouts</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PINOUTS.map((p) => (
          <Card key={p.name}>
            <CardTitle className="text-base">{p.name}</CardTitle>
            <p className="mb-3 text-sm text-muted">{p.description}</p>
            <ul className="grid grid-cols-2 gap-1 text-sm">
              {p.pins.map((pin) => (
                <li key={pin.pin} className="flex items-baseline gap-2 rounded border border-border px-2 py-1">
                  <span className="w-6 shrink-0 font-mono font-semibold text-accent">{pin.pin}</span>
                  <span>
                    {pin.name}
                    {pin.note ? <span className="text-muted"> · {pin.note}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
