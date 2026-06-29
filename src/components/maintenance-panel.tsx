'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { rebuildSearchIndexAction } from '@/server/actions/maintenance';
import { backfillTopicsAction } from '@/server/actions/videos';
import { RefreshCcw, Tags, Wand2 } from 'lucide-react';

export function MaintenancePanel() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <Card>
      <CardTitle className="mb-1">Maintenance</CardTitle>
      <CardDescription className="mb-4">
        Re-run first-time setup, re-tag videos, or rebuild the search index.
      </CardDescription>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/setup"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-elevated px-4 text-sm font-medium hover:bg-border/60"
        >
          <Wand2 className="h-4 w-4" aria-hidden /> Re-run setup
        </Link>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await backfillTopicsAction();
              setMsg(`Re-tagged ${r.updated} video${r.updated === 1 ? '' : 's'}.`);
            })
          }
        >
          <Tags className="h-4 w-4" aria-hidden /> Backfill topics
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await rebuildSearchIndexAction();
              setMsg(`Indexed ${r.count} item${r.count === 1 ? '' : 's'}.`);
            })
          }
        >
          <RefreshCcw className="h-4 w-4" aria-hidden /> Rebuild search index
        </Button>
      </div>
      {msg ? (
        <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">
          {msg}
        </p>
      ) : null}
    </Card>
  );
}
