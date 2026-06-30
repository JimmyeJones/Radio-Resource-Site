'use client';
import { Input } from '@/components/ui/input';

export function CalcField({
  label,
  value,
  onChange,
  unit,
  step = 'any',
  min,
  id,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  step?: number | 'any';
  min?: number;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {unit ? <span className="ml-1 text-muted">({unit})</span> : null}
      </label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export function Result({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-base font-normal text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}
