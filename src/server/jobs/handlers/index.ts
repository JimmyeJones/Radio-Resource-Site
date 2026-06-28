import type { Job } from '@/db/schema';
import { runYtDownload } from './yt-download';
import { runArticleArchive } from './article-archive';
import { runChannelPoll } from './channel-poll';
import { runTleRefresh } from './tle-refresh';

export type ProgressFn = (pct: number, msg?: string) => void;

export async function runJob(job: Job, onProgress: ProgressFn): Promise<void> {
  switch (job.kind) {
    case 'yt_download':
      await runYtDownload(job, onProgress);
      return;
    case 'article_archive':
      await runArticleArchive(job, onProgress);
      return;
    case 'channel_poll':
      await runChannelPoll(job, onProgress);
      return;
    case 'tle_refresh':
      await runTleRefresh(job, onProgress);
      return;
    default: {
      const _exhaustive: never = job.kind;
      throw new Error(`Unknown job kind: ${_exhaustive as string}`);
    }
  }
}
