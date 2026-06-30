'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createProjectAction } from '@/server/actions/projects';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function NewProjectForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createProjectAction(fd);
      if (res?.ok && res.id) router.push(`/projects/${res.id}`);
      else setError(res?.error ?? 'Failed');
    });
  }

  if (!open) {
    return (
      <div className="mb-6">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden /> New project
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-xl border border-border bg-surface p-4" aria-label="New project">
      <div className="space-y-3">
        <div>
          <label htmlFor="proj-name" className="mb-1 block text-sm font-medium">Name</label>
          <Input id="proj-name" name="name" required placeholder="L-band dish feed" />
        </div>
        <div>
          <label htmlFor="proj-desc" className="mb-1 block text-sm font-medium">Description (optional)</label>
          <Textarea id="proj-desc" name="description" rows={2} />
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>Create</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
