import { LOGIC_LEVELS, BUSES } from '@/lib/tools/interfaces';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function InterfacesPage() {
  return (
    <div>
      <PageHeader title="Logic & interface levels" description="Digital logic thresholds and common serial bus signaling." />

      <Card className="mb-6">
        <CardTitle className="mb-3">Logic levels</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Family</th>
                <th className="py-1 pr-4 font-semibold">V<sub>IH</sub></th>
                <th className="py-1 pr-4 font-semibold">V<sub>IL</sub></th>
                <th className="py-1 pr-4 font-semibold">V<sub>OH</sub></th>
                <th className="py-1 pr-4 font-semibold">V<sub>OL</sub></th>
                <th className="py-1 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {LOGIC_LEVELS.map((l) => (
                <tr key={l.family} className="border-t border-border">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{l.family}</th>
                  <td className="py-1.5 pr-4 font-mono">{l.vih}</td>
                  <td className="py-1.5 pr-4 font-mono">{l.vil}</td>
                  <td className="py-1.5 pr-4 font-mono">{l.voh}</td>
                  <td className="py-1.5 pr-4 font-mono">{l.vol}</td>
                  <td className="py-1.5 text-muted">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">Serial buses</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Bus</th>
                <th className="py-1 pr-4 font-semibold">Type</th>
                <th className="py-1 pr-4 font-semibold">Speed</th>
                <th className="py-1 pr-4 font-semibold">Wires</th>
                <th className="py-1 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {BUSES.map((b) => (
                <tr key={b.name} className="border-t border-border align-top">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{b.name}</th>
                  <td className="py-1.5 pr-4">{b.type}</td>
                  <td className="py-1.5 pr-4">{b.speed}</td>
                  <td className="py-1.5 pr-4 font-mono text-xs">{b.wires}</td>
                  <td className="py-1.5 text-muted">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
