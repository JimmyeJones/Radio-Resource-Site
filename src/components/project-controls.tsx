'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  setProjectStatusAction,
  renameProjectAction,
  deleteProjectAction,
} from '@/server/actions/projects';
import { Select, Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

type Status = 'planning' | 'active' | 'done' | 'archived';

export function ProjectControls({
  id,
  name,
  description,
  status,
}: {
  id: string;
  name: string;
  description: string | null;
  status: Status;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [n, setN] = useState(name);
  const [d, setD] = useState(description ?? '');
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="proj-status" className="text-sm text-muted">
        Status
      </label>
      <Select
        id="proj-status"
        defaultValue={status}
        className="h-9 w-40"
        onChange={(e) => start(() => void setProjectStatusAction(id, e.target.value as Status))}
      >
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="done">Done</option>
        <option value="archived">Archived</option>
      </Select>

      <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
        <Pencil className="h-4 w-4" aria-hidden /> Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (!confirm(`Delete project “${name}”? Linked items are not deleted.`)) return;
          start(async () => {
            await deleteProjectAction(id);
            router.push('/projects');
          });
        }}
      >
        <Trash2 className="h-4 w-4 text-danger" aria-hidden /> Delete
      </Button>

      {editing ? (
        <div className="mt-2 w-full rounded-lg border border-border bg-surface p-3">
          <label htmlFor="rn" className="mb-1 block text-sm font-medium">Name</label>
          <Input id="rn" value={n} onChange={(e) => setN(e.target.value)} />
          <label htmlFor="rd" className="mb-1 mt-3 block text-sm font-medium">Description</label>
          <Textarea id="rd" value={d} onChange={(e) => setD(e.target.value)} rows={2} />
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await renameProjectAction(id, n.trim() || name, d.trim() || null);
                  setEditing(false);
                })
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
