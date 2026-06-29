'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        router.push(v ? `/search?q=${encodeURIComponent(v)}` : '/search');
      }}
      className="mb-6 flex gap-2"
    >
      <label htmlFor="search-q" className="sr-only">
        Search query
      </label>
      <Input
        id="search-q"
        type="search"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search videos, transcripts, articles, datasheets…"
        className="max-w-xl"
      />
      <Button type="submit">
        <Search className="h-4 w-4" aria-hidden /> Search
      </Button>
    </form>
  );
}
