'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createNoteAction } from '@/server/actions/notes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function NewNoteForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await createNoteAction(fd);
          if (res?.ok && res.id) router.push(`/notes/${res.id}`);
        });
      }}
      className="mb-6 flex gap-2"
    >
      <label htmlFor="note-title" className="sr-only">New note title</label>
      <Input id="note-title" name="title" required placeholder="New note title…" className="max-w-md" />
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" aria-hidden /> Create
      </Button>
    </form>
  );
}
