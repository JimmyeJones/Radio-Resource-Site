import { db } from '@/db/client';
import { feeds, feedItems } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/page-header';
import { FeedsManager } from '@/components/feeds-manager';

export const dynamic = 'force-dynamic';

export default function FeedsPage() {
  const feedList = db.select().from(feeds).orderBy(desc(feeds.createdAt)).all();
  const titleById = new Map(feedList.map((f) => [f.id, f.title]));
  const items = db.select().from(feedItems).orderBy(desc(feedItems.createdAt)).limit(20).all();
  const recent = items.map((it) => ({ ...it, feedTitle: titleById.get(it.feedId) ?? '' }));

  return (
    <div>
      <PageHeader
        title="Feeds"
        description="Subscribe to blog and podcast RSS/Atom feeds. New blog posts can auto-archive into your reader."
      />
      <FeedsManager feeds={feedList} recent={recent} />
    </div>
  );
}
