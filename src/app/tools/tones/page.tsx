import { CTCSS_TONES, CTCSS_PL_CODES, DCS_CODES } from '@/lib/tools/tones';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';

export default function TonesPage() {
  return (
    <div>
      <PageHeader
        title="CTCSS / DCS tones"
        description="Sub-audible tone (PL) and digital squelch codes for repeater access."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">CTCSS tones (Hz)</CardTitle>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {CTCSS_TONES.map((t) => (
              <li key={t} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1 text-sm">
                <span className="font-mono">{t.toFixed(1)}</span>
                {CTCSS_PL_CODES[t] ? <span className="text-xs text-muted">{CTCSS_PL_CODES[t]}</span> : null}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">50 standard EIA tones; letters are traditional Motorola PL codes.</p>
        </Card>

        <Card>
          <CardTitle className="mb-3">DCS codes (octal)</CardTitle>
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {DCS_CODES.map((d) => (
              <li key={d} className="rounded border border-border px-2 py-1 text-center font-mono text-sm">
                {String(d).padStart(3, '0')}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Normal DCS codes; some radios also support inverted codes.</p>
        </Card>
      </div>
    </div>
  );
}
