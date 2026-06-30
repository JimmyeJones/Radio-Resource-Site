'use client';
import { useEffect, useState } from 'react';

export function HeroClock({ grid }: { grid?: string | null }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const z = (n: number) => String(n).padStart(2, '0');
  const utc = now ? `${z(now.getUTCHours())}:${z(now.getUTCMinutes())}:${z(now.getUTCSeconds())}` : '--:--:--';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-success live-dot" aria-hidden />
        <span className="font-mono text-base font-semibold tabular-nums">{utc}</span>
        <span className="text-muted">UTC</span>
      </span>
      {grid ? (
        <span className="text-muted">
          QTH <span className="font-mono text-fg">{grid}</span>
        </span>
      ) : null}
    </div>
  );
}
