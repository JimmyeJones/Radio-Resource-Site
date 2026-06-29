'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteDatasheetAction } from '@/server/actions/datasheets';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteDatasheetButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this datasheet and its PDF?')) return;
        start(async () => {
          await deleteDatasheetAction(id);
          router.push('/library/datasheets');
        });
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden /> Delete
    </Button>
  );
}
