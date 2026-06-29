import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { videos, articles, hubItems, projects, settings } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobFeed } from '@/components/job-feed';
import { formatRelative, formatDuration } from '@/lib/format';
import { Radio, Library, BookmarkPlus, Wrench, ArrowRight, FolderKanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const s = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (s && !s.setupComplete) redirect('/setup');

  const recentVideos = db.select().from(videos).orderBy(desc(videos.addedAt)).limit(4).all();
  const recentArticles = db.select().from(articles).orderBy(desc(articles.archivedAt)).limit(4).all();
  const counts = {
    videos: db.select({ n: sql<number>`count(*)` }).from(videos).get()?.n ?? 0,
    articles: db.select({ n: sql<number>`count(*)` }).from(articles).get()?.n ?? 0,
    hub: db.select({ n: sql<number>`count(*)` }).from(hubItems).get()?.n ?? 0,
    projects: db.select({ n: sql<number>`count(*)` }).from(projects).get()?.n ?? 0,
  };

  return (
    <div>
      <section className="mb-10 rounded-2xl border border-border bg-gradient-to-br from-surface to-elevated p-8">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-accent/15 p-3 text-accent">
            <Radio className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your distraction-free radio library
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Ham radio, satellites, radio astronomy, SDR. Local downloads, clean reader, curated
              hub, and interactive tools — no ads, no autoplay-next, no algorithm.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <QuickLink href="/library/videos" Icon={Library}>Open library</QuickLink>
              <QuickLink href="/projects" Icon={FolderKanban}>Projects</QuickLink>
              <QuickLink href="/hub" Icon={BookmarkPlus}>Resource hub</QuickLink>
              <QuickLink href="/tools" Icon={Wrench}>Reference tools</QuickLink>
            </div>
          </div>
        </div>
      </section>

      <JobFeed />

      <PageHeader title="At a glance" />
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Videos" value={counts.videos} href="/library/videos" />
        <Stat label="Archived articles" value={counts.articles} href="/library/articles" />
        <Stat label="Projects" value={counts.projects} href="/projects" />
        <Stat label="Hub entries" value={counts.hub} href="/hub" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-label="Recent videos">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Recent videos</h2>
            <Link href="/library/videos" className="text-sm text-accent hover:underline">All →</Link>
          </header>
          {recentVideos.length === 0 ? (
            <Card className="text-muted"><p>Nothing here yet. Add a YouTube URL on the videos page.</p></Card>
          ) : (
            <ul className="space-y-2">
              {recentVideos.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/library/videos/${v.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded bg-elevated">
                      {v.thumbnailPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/thumb/${v.id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {v.channel ?? 'Unknown'}{v.durationS ? ` · ${formatDuration(v.durationS)}` : ''} · {formatRelative(v.addedAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Recent articles">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Recent articles</h2>
            <Link href="/library/articles" className="text-sm text-accent hover:underline">All →</Link>
          </header>
          {recentArticles.length === 0 ? (
            <Card className="text-muted"><p>Nothing here yet. Archive an article to start.</p></Card>
          ) : (
            <ul className="space-y-2">
              {recentArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/library/articles/${a.id}`}
                    className="block rounded-lg border border-border bg-surface p-3 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium leading-snug">{a.title}</h3>
                      <span className="text-xs text-muted">{formatRelative(a.archivedAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {a.siteName ?? new URL(a.sourceUrl).hostname}
                      {a.wordCount ? ` · ${a.wordCount} words` : ''}
                      {a.readAt ? ' · ' : ''}{a.readAt ? <Badge tone="success">Read</Badge> : null}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function QuickLink({ href, Icon, children }: { href: string; Icon: typeof Radio; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg shadow-sm transition-colors hover:opacity-90"
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-surface p-5 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
        <ArrowRight className="h-5 w-5 text-muted group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
      </div>
    </Link>
  );
}
