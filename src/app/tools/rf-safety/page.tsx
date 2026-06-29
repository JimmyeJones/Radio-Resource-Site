import { MPE_LIMITS, SAFETY_NOTES } from '@/lib/tools/rf-safety';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function RfSafetyPage() {
  return (
    <div>
      <PageHeader title="RF exposure & safety" description="FCC maximum permissible exposure (MPE) summary and practical rules of thumb." />

      <Card className="mb-6">
        <CardTitle className="mb-3">MPE power-density limits</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Frequency</th>
                <th className="py-1 pr-4 font-semibold">Occupational (mW/cm²)</th>
                <th className="py-1 font-semibold">Public (mW/cm²)</th>
              </tr>
            </thead>
            <tbody>
              {MPE_LIMITS.map((r) => (
                <tr key={r.range} className="border-t border-border">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{r.range}</th>
                  <td className="py-1.5 pr-4 font-mono">{r.occupationalMwCm2}</td>
                  <td className="py-1.5 font-mono">{r.publicMwCm2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">Practical notes</CardTitle>
        <ul className="list-disc space-y-2 pl-5 text-sm text-fg/85">
          {SAFETY_NOTES.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </Card>
      <p className="mt-4 text-xs text-muted">Summary of FCC OET Bulletin 65 — consult the official tables and an exposure calculator for your actual station evaluation.</p>
    </div>
  );
}
