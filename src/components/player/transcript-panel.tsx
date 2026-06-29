'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { playerBus } from './player-bus';
import { addBookmarkAction, deleteBookmarkAction } from '@/server/actions/bookmarks';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Trash2, FileText } from 'lucide-react';
import type { VideoBookmark } from '@/db/schema';

interface Cue { start: number; text: string }

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

export function TranscriptPanel({ videoId, hasSubs, bookmarks }: { videoId: string; hasSubs: boolean; bookmarks: VideoBookmark[] }) {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [tab, setTab] = useState<'bookmarks' | 'transcript'>(bookmarks.length || !hasSubs ? 'bookmarks' : 'transcript');
  const [label, setLabel] = useState('');
  const [pending, start] = useTransition();
  const loaded = useRef(false);

  useEffect(() => {
    if (tab === 'transcript' && !loaded.current && hasSubs) {
      loaded.current = true;
      fetch(`/api/transcript/${videoId}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => setCues(d.cues ?? []))
        .catch(() => setCues([]));
    }
  }, [tab, hasSubs, videoId]);

  function addBookmark() {
    const t = playerBus.getTime?.() ?? 0;
    start(async () => {
      await addBookmarkAction(videoId, t, label || fmt(t));
      setLabel('');
    });
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTab('bookmarks')}
          className={`rounded-md px-3 py-1 text-sm ${tab === 'bookmarks' ? 'bg-elevated font-medium' : 'text-muted hover:text-fg'}`}
        >
          <Bookmark className="mr-1 inline h-4 w-4" aria-hidden /> Bookmarks
        </button>
        {hasSubs ? (
          <button
            type="button"
            onClick={() => setTab('transcript')}
            className={`rounded-md px-3 py-1 text-sm ${tab === 'transcript' ? 'bg-elevated font-medium' : 'text-muted hover:text-fg'}`}
          >
            <FileText className="mr-1 inline h-4 w-4" aria-hidden /> Transcript
          </button>
        ) : null}
      </div>

      {tab === 'bookmarks' ? (
        <div>
          <div className="mb-3 flex gap-2">
            <label htmlFor="bm-label" className="sr-only">Bookmark label</label>
            <Input id="bm-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="h-9" />
            <Button size="sm" onClick={addBookmark} disabled={pending}>
              <Bookmark className="h-4 w-4" aria-hidden /> Add at current time
            </Button>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted">No bookmarks yet. Pause at a moment and add one.</p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-auto">
              {bookmarks.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playerBus.seek?.(b.tSeconds)}
                    className="flex-1 rounded px-2 py-1 text-left text-sm hover:bg-elevated"
                  >
                    <span className="mr-2 font-mono text-accent">{fmt(b.tSeconds)}</span>
                    {b.label}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete bookmark"
                    onClick={() => start(() => void deleteBookmarkAction(b.id, videoId))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-elevated"
                  >
                    <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="max-h-96 overflow-auto">
          {cues === null ? (
            <p className="text-sm text-muted">Loading transcript…</p>
          ) : cues.length === 0 ? (
            <p className="text-sm text-muted">No transcript available.</p>
          ) : (
            <ul className="space-y-0.5">
              {cues.map((c, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => playerBus.seek?.(c.start)}
                    className="flex w-full gap-3 rounded px-2 py-1 text-left text-sm hover:bg-elevated"
                  >
                    <span className="shrink-0 font-mono text-xs text-accent">{fmt(c.start)}</span>
                    <span>{c.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
