'use client';
import { useMemo, useState } from 'react';
import { Q_CODES } from '@/lib/tools/q-codes';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';

export default function QCodesPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return Q_CODES;
    return Q_CODES.filter(
      (c) =>
        c.code.toLowerCase().includes(needle) ||
        c.question.toLowerCase().includes(needle) ||
        c.statement.toLowerCase().includes(needle) ||
        (c.notes ?? '').toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div>
      <PageHeader title="Q-codes" description="Common amateur Q-signals. Search by code or meaning." />
      <label htmlFor="qsearch" className="sr-only">
        Search Q-codes
      </label>
      <Input
        id="qsearch"
        type="search"
        autoComplete="off"
        placeholder="Search for a Q-code or word…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-6 max-w-md"
      />
      <div role="status" aria-live="polite" className="sr-only">
        {filtered.length} result{filtered.length === 1 ? '' : 's'}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">Code</th>
              <th scope="col" className="px-4 py-2 font-semibold">Question</th>
              <th scope="col" className="px-4 py-2 font-semibold">Statement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.code} className="border-t border-border align-top">
                <th scope="row" className="px-4 py-3 font-mono text-accent">{c.code}</th>
                <td className="px-4 py-3 text-fg/80">{c.question}</td>
                <td className="px-4 py-3">
                  {c.statement}
                  {c.notes ? <div className="mt-1 text-xs text-muted">{c.notes}</div> : null}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted">
                  No matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
