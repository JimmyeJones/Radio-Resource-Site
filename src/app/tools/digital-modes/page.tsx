import { DIGITAL_MODES } from '@/lib/tools/references';
import { PageHeader } from '@/components/page-header';

export default function DigitalModesPage() {
  return (
    <div>
      <PageHeader title="Digital modes" description="Common amateur digital modes at a glance." />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Mode</th>
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Bandwidth</th>
              <th className="px-4 py-2 font-semibold">Typical use</th>
            </tr>
          </thead>
          <tbody>
            {DIGITAL_MODES.map((m) => (
              <tr key={m.name} className="border-t border-border">
                <th scope="row" className="px-4 py-2 font-semibold">{m.name}</th>
                <td className="px-4 py-2">{m.type}</td>
                <td className="px-4 py-2 font-mono">{m.bandwidth}</td>
                <td className="px-4 py-2 text-fg/85">{m.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
