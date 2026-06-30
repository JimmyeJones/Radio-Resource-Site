'use client';
import { useState, useTransition, useEffect } from 'react';
import { saveProjectNotesAction } from '@/server/actions/projects';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export function ProjectNotes({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => setSaved(value === initial), [value, initial]);

  function save() {
    start(async () => {
      await saveProjectNotesAction(id, value);
      setSaved(true);
    });
  }

  return (
    <div>
      <label htmlFor="project-notes" className="sr-only">
        Project notes
      </label>
      <Textarea
        id="project-notes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={14}
        placeholder="Build log, measurements, part numbers, to-dos…"
        className="font-mono text-sm"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={pending || saved}>
          <Save className="h-4 w-4" aria-hidden /> {saved ? 'Saved' : 'Save notes'}
        </Button>
        {!saved ? <span className="text-xs text-muted">Unsaved changes</span> : null}
      </div>
    </div>
  );
}
