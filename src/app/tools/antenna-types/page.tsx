import { ANTENNA_TYPES } from '@/lib/tools/antenna-types';
import { PageHeader } from '@/components/page-header';

export default function AntennaTypesPage() {
  return (
    <div>
      <PageHeader title="Antenna types & gain" description="Typical gain, pattern, and use for common amateur antennas." />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Antenna</th>
              <th className="px-4 py-2 font-semibold">Typical gain</th>
              <th className="px-4 py-2 font-semibold">Pattern</th>
              <th className="px-4 py-2 font-semibold">Polarization</th>
              <th className="px-4 py-2 font-semibold">Use</th>
            </tr>
          </thead>
          <tbody>
            {ANTENNA_TYPES.map((a) => (
              <tr key={a.name} className="border-t border-border align-top">
                <th scope="row" className="px-4 py-2 font-semibold">{a.name}</th>
                <td className="px-4 py-2 font-mono">{a.gain}</td>
                <td className="px-4 py-2">{a.pattern}</td>
                <td className="px-4 py-2">{a.polarization}</td>
                <td className="px-4 py-2 text-muted">{a.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">dBd = gain over a dipole; dBi = over isotropic (dBi = dBd + 2.15). See the Gain units tool.</p>
    </div>
  );
}
