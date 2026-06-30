'use client';
import { useState, useTransition } from 'react';
import { TOPIC_LABELS, topicLabel } from '@/lib/topics';
import { setVideoTopicsAction } from '@/server/actions/videos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { Tag, Check } from 'lucide-react';

const ALL_TOPICS = Object.keys(TOPIC_LABELS).filter((t) => t !== 'uncategorized');

export function TopicEditor({ videoId, initial }: { videoId: string; initial: string[] }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [pending, start] = useTransition();

  function toggle(t: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function save() {
    start(async () => {
      await setVideoTopicsAction(videoId, Array.from(selected));
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {initial.length ? (
          initial.map((t) => <Badge key={t} tone="accent">{topicLabel(t)}</Badge>)
        ) : (
          <span className="text-sm text-muted">No topics</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Tag className="h-4 w-4" aria-hidden /> Edit topics
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 text-sm font-medium">Topics</p>
      <div className="flex flex-wrap gap-1.5">
        {ALL_TOPICS.map((t) => {
          const on = selected.has(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                on ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface hover:bg-elevated',
              )}
            >
              {topicLabel(t)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={pending}>
          <Check className="h-4 w-4" aria-hidden /> Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setSelected(new Set(initial)); setEditing(false); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
