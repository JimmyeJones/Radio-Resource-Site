import { TIME_STATIONS } from '@/lib/tools/time-signals';
import { PageHeader } from '@/components/page-header';
import { ZuluClock } from '@/components/zulu-clock';
import { Card, CardTitle } from '@/components/ui/card';

export default function TimePage() {
  return (
    <div>
      <PageHeader title="UTC & time signals" description="A live Zulu clock and the standard time-signal stations you can tune." />
      <div className="mb-6 max-w-md">
        <ZuluClock />
      </div>
      <Card>
        <CardTitle className="mb-3">Standard time-signal stations</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-1 pr-4 font-semibold">Station</th>
                <th className="py-1 pr-4 font-semibold">Location</th>
                <th className="py-1 pr-4 font-semibold">Frequencies</th>
                <th className="py-1 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {TIME_STATIONS.map((s) => (
                <tr key={s.call} className="border-t border-border align-top">
                  <th scope="row" className="py-1.5 pr-4 font-semibold">{s.call}</th>
                  <td className="py-1.5 pr-4">{s.location}</td>
                  <td className="py-1.5 pr-4 font-mono">{s.freqs}</td>
                  <td className="py-1.5 text-muted">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
