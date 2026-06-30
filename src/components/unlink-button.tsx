'use client';
import { useTransition } from 'react';
import { unlinkItemAction } from '@/server/actions/projects';
import { X } from 'lucide-react';

export function UnlinkButton({ linkId, projectId }: { linkId: string; projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Remove from project"
      disabled={pending}
      onClick={() => start(() => void unlinkItemAction(linkId, projectId))}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted hover:bg-elevated hover:text-danger"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}
