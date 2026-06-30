import { S_METER, DB_RATIOS } from '@/lib/tools/references';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function SMeterPage() {
  return (
    <div>
      <PageHeader
        title="dB & S-meter reference"
        description="S-units to dBm/µV (HF, S9 = −73 dBm = 50 µV, 6 dB per unit) and quick dB ratios."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">S-meter scale</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="py-1 pr-4 font-semibold">S-unit</th>
                  <th className="py-1 pr-4 font-semibold">dBm</th>
                  <th className="py-1 font-semibold">µV (50 Ω)</th>
                </tr>
              </thead>
              <tbody>
                {S_METER.map((r) => (
                  <tr key={r.s} className="border-t border-border">
                    <th scope="row" className="py-1.5 pr-4 font-semibold">{r.s}</th>
                    <td className="py-1.5 pr-4 font-mono">{r.dbm.toFixed(0)}</td>
                    <td className="py-1.5 font-mono">{r.uv50 < 10 ? r.uv50.toFixed(2) : r.uv50.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardTitle className="mb-3">dB ratios</CardTitle>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">dB</th>
                <th className="py-1 pr-4 font-semibold">Power</th>
                <th className="py-1 font-semibold">Voltage</th>
              </tr>
            </thead>
            <tbody>
              {DB_RATIOS.map((r) => (
                <tr key={r.db} className="border-t border-border">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{r.db} dB</th>
                  <td className="py-1.5 pr-4 font-mono">{r.power}</td>
                  <td className="py-1.5 font-mono">{r.voltage}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">+3 dB ≈ double power · +6 dB ≈ double voltage · +10 dB = 10× power.</p>
        </Card>
      </div>
    </div>
  );
}
