import Link from 'next/link';
import { db } from '@/db/client';
import { videos, articles, datasheets } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Video, Newspaper, ArrowRight, FileText, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LibraryIndex() {
  const vidCount = db.select({ n: sql<number>`count(*)` }).from(videos).get()?.n ?? 0;
  const artCount = db.select({ n: sql<number>`count(*)` }).from(articles).get()?.n ?? 0;
  const dsCount = db.select({ n: sql<number>`count(*)` }).from(datasheets).get()?.n ?? 0;
  const queueCount =
    db
      .select({ n: sql<number>`count(*)` })
      .from(videos)
      .where(and(eq(videos.watchLater, true), isNull(videos.watchedAt)))
      .get()?.n ?? 0;

  const cards = [
    { href: '/library/videos', Icon: Video, title: 'Videos', desc: `${vidCount} downloaded · ad-free playback` },
    { href: '/library/queue', Icon: Clock, title: 'Watch later', desc: `${queueCount} queued` },
    { href: '/library/articles', Icon: Newspaper, title: 'Articles', desc: `${artCount} archived · reader view` },
    { href: '/library/datasheets', Icon: FileText, title: 'Datasheets', desc: `${dsCount} saved · offline PDFs` },
  ];

  return (
    <div>
      <PageHeader
        title="Library"
        description="Your local, distraction-free collection of videos, articles, and datasheets."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, Icon, title, desc }) => (
          <li key={href}>
            <Link href={href} className="group block focus:outline-none">
              <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-md bg-accent/10 p-2 text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{desc}</CardDescription>
                <div className="mt-4 flex items-center gap-1 text-sm text-accent">
                  Browse <ArrowRight className="h-4 w-4" aria-hidden />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
