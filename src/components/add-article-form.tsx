'use client';
import { useTransition, useState } from 'react';
import { archiveArticleAction } from '@/server/actions/articles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookmarkPlus } from 'lucide-react';

export function AddArticleForm() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await archiveArticleAction(fd);
      if (res?.ok) {
        setStatus('Archiving started.');
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
      aria-label="Archive an article"
    >
      <label htmlFor="article-url" className="sr-only">
        Article URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="article-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com/some-article"
        />
        <Button type="submit" disabled={pending}>
          <BookmarkPlus className="h-4 w-4" aria-hidden />
          {pending ? 'Working…' : 'Archive'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Pages are fetched server-side, stripped of nav/ads, and stored locally for distraction-free reading.
      </p>
      {status ? (
        <p role="status" aria-live="polite" className="mt-2 text-sm">
          {status}
        </p>
      ) : null}
    </form>
  );
}
