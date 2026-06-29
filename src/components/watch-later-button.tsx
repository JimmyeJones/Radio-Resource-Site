'use client';
import { useState, useTransition } from 'react';
import { toggleWatchLaterAction } from '@/server/actions/videos';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export function WatchLaterButton({ videoId, initial }: { videoId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <Button
      variant={on ? 'primary' : 'secondary'}
      size="sm"
      aria-pressed={on}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleWatchLaterAction(videoId);
          if (res?.ok) setOn(Boolean(res.watchLater));
        })
      }
    >
      <Clock className="h-4 w-4" aria-hidden />
      {on ? 'In watch later' : 'Watch later'}
    </Button>
  );
}
