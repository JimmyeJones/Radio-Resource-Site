import { E_SERIES, AWG_TABLE, SMD_SIZES } from '@/lib/tools/references';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function ElectronicsReferencePage() {
  return (
    <div>
      <PageHeader title="Electronics reference tables" description="E-series standard values, AWG wire, and SMD package sizes." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">E-series standard values</CardTitle>
          {Object.entries(E_SERIES).map(([name, vals]) => (
            <div key={name} className="mb-3">
              <p className="mb-1 text-sm font-semibold">{name}</p>
              <p className="font-mono text-sm text-muted">{vals.join(', ')}</p>
            </div>
          ))}
          <p className="text-xs text-muted">Multiply by powers of ten for each decade (e.g. 4.7 → 47, 470, 4.7k…).</p>
        </Card>

        <Card>
          <CardTitle className="mb-3">SMD package sizes</CardTitle>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-1 pr-3 font-semibold">Imperial</th><th className="py-1 pr-3 font-semibold">Metric</th><th className="py-1 font-semibold">Size (mm)</th></tr>
            </thead>
            <tbody>
              {SMD_SIZES.map((s) => (
                <tr key={s.code} className="border-t border-border">
                  <th scope="row" className="py-1.5 pr-3 font-mono font-semibold">{s.imperial}</th>
                  <td className="py-1.5 pr-3 font-mono">{s.metric}</td>
                  <td className="py-1.5 font-mono">{s.mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-3">AWG wire</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="py-1 pr-4 font-semibold">AWG</th>
                  <th className="py-1 pr-4 font-semibold">Diameter (mm)</th>
                  <th className="py-1 pr-4 font-semibold">Ω / km</th>
                  <th className="py-1 font-semibold">Max amps (chassis)</th>
                </tr>
              </thead>
              <tbody>
                {AWG_TABLE.map((r) => (
                  <tr key={r.awg} className="border-t border-border">
                    <th scope="row" className="py-1.5 pr-4 font-semibold">{r.awg}</th>
                    <td className="py-1.5 pr-4 font-mono">{r.diaMm.toFixed(3)}</td>
                    <td className="py-1.5 pr-4 font-mono">{r.ohmPerKm}</td>
                    <td className="py-1.5 font-mono">{r.ampsChassis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
