import type { Job } from '@/db/schema';
import { runYtDownload } from './yt-download';
import { runArticleArchive } from './article-archive';
import { runChannelPoll } from './channel-poll';
import { runTleRefresh } from './tle-refresh';
import { runDatasheetFetch } from './datasheet-fetch';
import { runDatasheetLookup } from './datasheet-lookup';
import { runSpaceWeatherRefresh } from './space-weather-refresh';
import { runFeedPoll } from './feed-poll';

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
      await runDatasheetLookup(job, onProgress);
      return;
    case 'space_weather_refresh':
      await runSpaceWeatherRefresh(job, onProgress);
      return;
    case 'feed_poll':
      await runFeedPoll(job, onProgress);
      return;
    default: {
      const _exhaustive: never = job.kind;
      throw new Error(`Unknown job kind: ${_exhaustive as string}`);
    }
  }
}
