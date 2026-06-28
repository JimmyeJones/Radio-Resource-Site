'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteVideoAction } from '@/server/actions/videos';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteVideoButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => {
        if (!confirm('Delete this video and its local files?')) return;
        start(async () => {
          await deleteVideoAction(id);
          router.push('/library/videos');
        });
      }}
      disabled={pending}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      Delete
    </Button>
  );
}
