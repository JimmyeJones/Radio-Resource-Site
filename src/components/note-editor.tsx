'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveNoteAction, deleteNoteAction } from '@/server/actions/notes';
import { renderMarkdown } from '@/lib/markdown';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Eye, Pencil } from 'lucide-react';
import type { Note } from '@/db/schema';

export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState((note.tags ?? []).join(', '));
  const [preview, setPreview] = useState(false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(true);

  function save() {
    start(async () => {
      await saveNoteAction(note.id, title, body, tags);
      setSaved(true);
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label htmlFor="note-title" className="sr-only">Title</label>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          className="max-w-md text-lg font-semibold"
        />
        <Button variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
          {preview ? <Pencil className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {preview ? 'Edit' : 'Preview'}
        </Button>
        <Button size="sm" onClick={save} disabled={pending || saved}>
          <Save className="h-4 w-4" aria-hidden /> {saved ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!confirm('Delete this note?')) return;
            await deleteNoteAction(note.id);
            router.push('/notes');
          }}
        >
          <Trash2 className="h-4 w-4 text-danger" aria-hidden /> Delete
        </Button>
      </div>

      <div className="mb-3">
        <label htmlFor="note-tags" className="mb-1 block text-sm font-medium">Tags</label>
        <Input id="note-tags" value={tags} onChange={(e) => { setTags(e.target.value); setSaved(false); }} placeholder="antennas, build-log" className="max-w-md" />
      </div>

      {preview ? (
        <div
          className="prose-reader reader-sans rounded-xl border border-border bg-surface p-6"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) || '<p class="text-muted">Nothing to preview.</p>' }}
        />
      ) : (
        <>
          <label htmlFor="note-body" className="sr-only">Note body (markdown)</label>
          <Textarea
            id="note-body"
            value={body}
            onChange={(e) => { setBody(e.target.value); setSaved(false); }}
            rows={20}
            placeholder="Write in Markdown — # headings, **bold**, - lists, `code`, [links](https://…)"
            className="font-mono text-sm"
          />
        </>
      )}
    </div>
  );
}
