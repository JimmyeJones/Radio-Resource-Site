import { Loader2 } from 'lucide-react';

// Shown automatically during route transitions so navigation feels instant
// even while a server component runs its database queries.
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
