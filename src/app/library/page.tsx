import Link from 'next/link';
import { db } from '@/db/client';
import { videos, articles } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Video, Newspaper, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LibraryIndex() {
  const vidCount = db.select({ n: sql<number>`count(*)` }).from(videos).get()?.n ?? 0;
  const artCount = db.select({ n: sql<number>`count(*)` }).from(articles).get()?.n ?? 0;
  return (
    <div>
      <PageHeader
        title="Library"
        description="Your local, distraction-free collection of videos and articles."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link href="/library/videos" className="group block focus:outline-none">
            <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-md bg-accent/10 p-2 text-accent">
                  <Video className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle>Videos</CardTitle>
              </div>
              <CardDescription>{vidCount} downloaded · ad-free playback</CardDescription>
              <div className="mt-4 flex items-center gap-1 text-sm text-accent">
                Browse <ArrowRight className="h-4 w-4" aria-hidden />
              </div>
            </Card>
          </Link>
        </li>
        <li>
          <Link href="/library/articles" className="group block focus:outline-none">
            <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-md bg-accent/10 p-2 text-accent">
                  <Newspaper className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle>Articles</CardTitle>
              </div>
              <CardDescription>{artCount} archived · distraction-free reader</CardDescription>
              <div className="mt-4 flex items-center gap-1 text-sm text-accent">
                Browse <ArrowRight className="h-4 w-4" aria-hidden />
              </div>
            </Card>
          </Link>
        </li>
      </ul>
    </div>
  );
}
