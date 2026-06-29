import { SAT_MODE_NOTATION, SAT_DIRECTORY, SAT_RESOURCES } from '@/lib/tools/sat-directory';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export default function SatFrequenciesPage() {
  return (
    <div>
      <PageHeader title="Satellite modes & frequencies" description="Mode notation, an uplink/downlink master list, and the tools worth bookmarking." />

      <Card className="mb-6">
        <CardTitle className="mb-3">Mode notation</CardTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SAT_MODE_NOTATION.map((m) => (
            <li key={m.code} className="flex gap-2 rounded border border-border px-3 py-2 text-sm">
              <span className="w-12 shrink-0 font-mono font-semibold text-accent">{m.code}</span>
              <span>{m.meaning}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-6">
        <CardTitle className="mb-3">Frequency directory (MHz)</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-3 font-semibold">Satellite</th>
                <th className="py-1 pr-3 font-semibold">Type</th>
                <th className="py-1 pr-3 font-semibold">Mode</th>
                <th className="py-1 pr-3 font-semibold">Uplink</th>
                <th className="py-1 pr-3 font-semibold">Downlink</th>
                <th className="py-1 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {SAT_DIRECTORY.map((s) => (
                <tr key={s.name} className="border-t border-border align-top">
                  <th scope="row" className="py-1.5 pr-3 font-semibold">{s.name}</th>
                  <td className="py-1.5 pr-3">{s.type}</td>
                  <td className="py-1.5 pr-3"><Badge>{s.mode}</Badge></td>
                  <td className="py-1.5 pr-3 font-mono">{s.uplink}</td>
                  <td className="py-1.5 pr-3 font-mono">{s.downlink}</td>
                  <td className="py-1.5 text-muted">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Frequencies are typical; always confirm against AMSAT before a pass.</p>
      </Card>

      <Card>
        <CardTitle className="mb-3">Resources & tools</CardTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SAT_RESOURCES.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm hover:border-accent">
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  <span className="font-medium">{r.title}</span>
                  <span className="block text-muted">{r.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
