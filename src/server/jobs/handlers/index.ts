import type { Job } from '@/db/schema';
import { runYtDownload } from './yt-download';
import { runArticleArchive } from './article-archive';
import { runChannelPoll } from './channel-poll';
import { runTleRefresh } from './tle-refresh';
import { runDatasheetFetch } from './datasheet-fetch';

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
    case 'datasheet_fetch':
      await runDatasheetFetch(job, onProgress);
      return;
    case 'datasheet_lookup':
    case 'feed_poll':
    case 'space_weather_refresh':
      // Registered now (job-kind union); handlers land in later roadmap phases.
      throw new Error(`Job kind not yet implemented: ${job.kind}`);
    default: {
      const _exhaustive: never = job.kind;
      throw new Error(`Unknown job kind: ${_exhaustive as string}`);
    }
  }
}
