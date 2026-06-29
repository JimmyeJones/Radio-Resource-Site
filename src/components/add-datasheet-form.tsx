'use client';
import { useState, useTransition } from 'react';
import { addDatasheetUrlAction, uploadDatasheetAction } from '@/server/actions/datasheets';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, Upload } from 'lucide-react';

export function AddDatasheetForm() {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    start(async () => {
      const res = mode === 'url' ? await addDatasheetUrlAction(fd) : await uploadDatasheetAction(fd);
      if (res?.ok) {
        setStatus(mode === 'url' ? 'Queued — downloading the PDF.' : 'Uploaded.');
        form.reset();
      } else {
        setStatus(res?.error ?? 'Failed');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-xl border border-border bg-surface p-4" aria-label="Add datasheet">
      <fieldset className="mb-3">
        <legend className="sr-only">Source</legend>
        <div role="radiogroup" className="inline-flex rounded-md border border-border bg-elevated p-0.5 text-sm">
          {(['url', 'upload'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 ${mode === m ? 'bg-surface font-medium text-fg' : 'text-fg/70 hover:text-fg'}`}
            >
              {m === 'url' ? 'From URL' : 'Upload PDF'}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ds-title" className="mb-1 block text-sm font-medium">Title</label>
          <Input id="ds-title" name="title" required placeholder="e.g. RTL-SDR R820T2 datasheet" />
        </div>
        <div>
          <label htmlFor="ds-part" className="mb-1 block text-sm font-medium">Part number</label>
          <Input id="ds-part" name="partNumber" placeholder="R820T2" />
        </div>
        <div>
          <label htmlFor="ds-mfr" className="mb-1 block text-sm font-medium">Manufacturer</label>
          <Input id="ds-mfr" name="manufacturer" placeholder="Rafael Micro" />
        </div>
        {mode === 'url' ? (
          <div className="sm:col-span-2">
            <label htmlFor="ds-url" className="mb-1 block text-sm font-medium">PDF URL</label>
            <Input id="ds-url" name="url" type="url" required placeholder="https://…/datasheet.pdf" />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label htmlFor="ds-file" className="mb-1 block text-sm font-medium">PDF file</label>
            <input
              id="ds-file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-2 file:text-fg"
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="ds-notes" className="mb-1 block text-sm font-medium">Notes</label>
          <Textarea id="ds-notes" name="notes" rows={2} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {mode === 'url' ? <Link2 className="h-4 w-4" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          {pending ? 'Working…' : mode === 'url' ? 'Fetch datasheet' : 'Upload datasheet'}
        </Button>
        {status ? <span role="status" aria-live="polite" className="text-sm">{status}</span> : null}
      </div>
    </form>
  );
}
