import { PROP_MODES } from '@/lib/tools/propagation-modes';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';

export default function PropagationModesPage() {
  return (
    <div>
      <PageHeader title="Propagation modes" description="How signals travel — and when each mode is worth chasing." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {PROP_MODES.map((m) => (
          <li key={m.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{m.name}</h2>
              <Badge tone="accent">{m.bands}</Badge>
            </div>
            <p className="mt-1 text-sm">{m.description}</p>
            <p className="mt-2 text-xs text-muted">{m.when}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
