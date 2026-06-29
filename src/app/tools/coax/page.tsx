import { COAX_REF } from '@/lib/tools/coax';
import { PageHeader } from '@/components/page-header';

export default function CoaxPage() {
  return (
    <div>
      <PageHeader title="Coax cable comparison" description="Impedance, velocity factor, loss, and power for common feedlines. Loss is dB/100ft." />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Cable</th>
              <th className="px-3 py-2 font-semibold">Z₀</th>
              <th className="px-3 py-2 font-semibold">VF</th>
              <th className="px-3 py-2 font-semibold">OD</th>
              <th className="px-3 py-2 font-semibold">30</th>
              <th className="px-3 py-2 font-semibold">150</th>
              <th className="px-3 py-2 font-semibold">450</th>
              <th className="px-3 py-2 font-semibold">1000 MHz</th>
              <th className="px-3 py-2 font-semibold">Power</th>
              <th className="px-3 py-2 font-semibold">Use</th>
            </tr>
          </thead>
          <tbody>
            {COAX_REF.map((c) => (
              <tr key={c.name} className="border-t border-border align-top">
                <th scope="row" className="px-3 py-2 font-semibold">{c.name}</th>
                <td className="px-3 py-2 font-mono">{c.impedanceOhm}Ω</td>
                <td className="px-3 py-2 font-mono">{c.velocityFactor}</td>
                <td className="px-3 py-2 font-mono">{c.outerMm} mm</td>
                {c.loss.map((l) => (
                  <td key={l.mhz} className="px-3 py-2 font-mono">{l.db}</td>
                ))}
                <td className="px-3 py-2">{c.powerW100MHz}</td>
                <td className="px-3 py-2 text-muted">{c.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">Typical manufacturer figures; loss rises with frequency and run length. For an exact run, use the coax-loss calculator in the Antenna tool.</p>
    </div>
  );
}
