import { SCHEMATIC_SYMBOLS } from '@/components/symbols/schematic-symbols';
import { PageHeader } from '@/components/page-header';

export default function SymbolsPage() {
  return (
    <div>
      <PageHeader title="Schematic symbols" description="A quick visual key to common component symbols." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCHEMATIC_SYMBOLS.map(({ name, note, Svg }) => (
          <li key={name} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex h-12 w-20 shrink-0 items-center justify-center text-fg">
              <Svg />
            </div>
            <div>
              <h2 className="font-medium">{name}</h2>
              <p className="text-sm text-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
