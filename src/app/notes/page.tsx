import Link from 'next/link';
import { db } from '@/db/client';
import { notes } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewNoteForm } from '@/components/new-note-form';
import { formatRelative } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function NotesPage() {
  const list = db.select().from(notes).orderBy(desc(notes.updatedAt)).all();
  return (
    <div>
      <PageHeader title="Notes" description="A personal markdown wiki — jot anything, search it later, link it to projects." />
      <NewNoteForm />
      {list.length === 0 ? (
        <Card className="text-center text-muted"><p>No notes yet. Create your first above.</p></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => (
            <li key={n.id}>
              <Link href={`/notes/${n.id}`} className="group block focus:outline-none">
                <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
                  <CardTitle className="group-hover:text-accent">{n.title}</CardTitle>
                  <p className="mt-1 line-clamp-3 text-sm text-muted">{n.body.replace(/[#*`>-]/g, '').slice(0, 160) || 'Empty note'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    {(n.tags ?? []).map((t) => <Badge key={t}>{t}</Badge>)}
                    <span className="ml-auto text-xs text-muted">{formatRelative(n.updatedAt)}</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
