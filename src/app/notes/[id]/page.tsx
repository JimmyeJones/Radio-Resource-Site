import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db/client';
import { notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NoteEditor } from '@/components/note-editor';
import { AddToProject } from '@/components/add-to-project';
import { listProjectsLite } from '@/server/actions/projects';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: { params: { id: string } }) {
  const n = db.select().from(notes).where(eq(notes.id, params.id)).get();
  if (!n) notFound();
  const projects = await listProjectsLite();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link href="/notes" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All notes
        </Link>
        <AddToProject itemType="note" itemId={n.id} projects={projects} />
      </div>
      <NoteEditor note={n} />
    </div>
  );
}
