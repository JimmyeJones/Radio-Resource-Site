'use client';
import { useState, useTransition } from 'react';
import { addVideoAction, addChannelAction } from '@/server/actions/videos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

export function AddVideoForm() {
  const [mode, setMode] = useState<'video' | 'channel'>('video');
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res =
        mode === 'video' ? await addVideoAction(data) : await addChannelAction(data);
      if (res?.ok) {
        setStatus(mode === 'video' ? 'Queued for download.' : 'Subscribed and polling.');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus(res?.error ?? 'Failed');
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-xl border border-border bg-surface p-4"
      aria-label="Add to library"
    >
      <fieldset className="mb-3">
        <legend className="sr-only">What are you adding?</legend>
        <div role="radiogroup" className="inline-flex rounded-md border border-border bg-elevated p-0.5 text-sm">
          {(['video', 'channel'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 capitalize ${
                mode === m ? 'bg-surface font-medium text-fg' : 'text-fg/70 hover:text-fg'
              }`}
            >
              {m === 'video' ? 'Single video' : 'Channel'}
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="url" className="sr-only">
        YouTube URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="url"
          name="url"
          type="url"
          required
          placeholder={
            mode === 'video'
              ? 'https://www.youtube.com/watch?v=…'
              : 'https://www.youtube.com/@channel or /channel/UC…'
          }
          aria-describedby="add-help"
        />
        <Button type="submit" disabled={pending}>
          {mode === 'video' ? <Download className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          {pending ? 'Working…' : mode === 'video' ? 'Download' : 'Subscribe'}
        </Button>
      </div>
      {mode === 'channel' ? (
        <label className="mt-3 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="autoDownload" className="h-4 w-4 accent-accent" />
          Auto-download new uploads
        </label>
      ) : null}
      <p id="add-help" className="mt-2 text-xs text-muted">
        Downloads run in the background with yt-dlp; the player streams the local copy.
      </p>
      {status ? (
        <p role="status" aria-live="polite" className="mt-2 text-sm">
          {status}
        </p>
      ) : null}
    </form>
  );
}
