'use client';
import { useState, useTransition } from 'react';
import { createProjectAction, linkItemAction, type ProjectItemType } from '@/server/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Check } from 'lucide-react';

interface Props {
  itemType: ProjectItemType;
  itemId: string;
  projects: { id: string; name: string }[];
}

export function AddToProject({ itemType, itemId, projects }: Props) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function add(projectId: string) {
    start(async () => {
      await linkItemAction(projectId, itemType, itemId);
      setDone(projectId);
      setOpen(false);
    });
  }

  function createAndAdd() {
    if (!newName.trim()) return;
    const fd = new FormData();
    fd.set('name', newName.trim());
    start(async () => {
      const res = await createProjectAction(fd);
      if (res?.ok && res.id) {
        await linkItemAction(res.id, itemType, itemId);
        setDone(res.id);
        setNewName('');
        setOpen(false);
      }
    });
  }

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {done ? <Check className="h-4 w-4" aria-hidden /> : <FolderPlus className="h-4 w-4" aria-hidden />}
        {done ? 'Added' : 'Add to project'}
      </Button>
      {open ? (
        <div
          className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-border bg-surface p-2 shadow-lg"
          role="menu"
        >
          {projects.length > 0 ? (
            <ul className="mb-2 max-h-48 overflow-auto">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() => add(p.id)}
                    className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-elevated"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-1 text-xs text-muted">No projects yet.</p>
          )}
          <div className="border-t border-border pt-2">
            <label htmlFor="new-project" className="sr-only">
              New project name
            </label>
            <Input
              id="new-project"
              placeholder="New project…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
              className="h-8 text-sm"
            />
            <Button size="sm" className="mt-2 w-full" onClick={createAndAdd} disabled={pending || !newName.trim()}>
              Create & add
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
