import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  youtubeId: text('youtube_id').notNull().unique(),
  title: text('title').notNull(),
  channel: text('channel'),
  channelId: text('channel_id'),
  description: text('description'),
  durationS: integer('duration_s'),
  publishedAt: integer('published_at'),
  filePath: text('file_path'),
  thumbnailPath: text('thumbnail_path'),
  subsPath: text('subs_path'),
  infoJsonPath: text('info_json_path'),
  addedAt: integer('added_at').notNull().default(sql`(unixepoch())`),
  watchedAt: integer('watched_at'),
  progressS: integer('progress_s').notNull().default(0),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
});
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(),
  youtubeId: text('youtube_id').notNull().unique(),
  name: text('name').notNull(),
  rssUrl: text('rss_url').notNull(),
  lastPolledAt: integer('last_polled_at'),
  autoDownload: integer('auto_download', { mode: 'boolean' }).notNull().default(false),
  addedAt: integer('added_at').notNull().default(sql`(unixepoch())`),
});
export type Channel = typeof channels.$inferSelect;

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  sourceUrl: text('source_url').notNull(),
  title: text('title').notNull(),
  byline: text('byline'),
  siteName: text('site_name'),
  excerpt: text('excerpt'),
  htmlPath: text('html_path').notNull(),
  publishedAt: integer('published_at'),
  archivedAt: integer('archived_at').notNull().default(sql`(unixepoch())`),
  readAt: integer('read_at'),
  wordCount: integer('word_count').notNull().default(0),
  lang: text('lang'),
});
export type Article = typeof articles.$inferSelect;

export const hubItems = sqliteTable('hub_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  kind: text('kind', { enum: ['channel', 'blog', 'reference', 'tool', 'podcast', 'forum', 'other'] })
    .notNull()
    .default('other'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type HubItem = typeof hubItems.$inferSelect;
export type NewHubItem = typeof hubItems.$inferInsert;

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  kind: text('kind', {
    enum: ['yt_download', 'article_archive', 'channel_poll', 'tle_refresh'],
  }).notNull(),
  payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  status: text('status', {
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
  })
    .notNull()
    .default('queued'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  progress: real('progress').notNull().default(0),
  message: text('message'),
  error: text('error'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  startedAt: integer('started_at'),
  finishedAt: integer('finished_at'),
});
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey().default(1),
  qthGrid: text('qth_grid'),
  qthLat: real('qth_lat'),
  qthLon: real('qth_lon'),
  qthElevationM: real('qth_elevation_m').default(0),
  theme: text('theme', { enum: ['system', 'light', 'dark'] }).notNull().default('system'),
  downloadFormatCode: text('download_format_code').notNull().default('bv*+ba/b'),
  maxHeight: integer('max_height').notNull().default(1080),
  defaultSubsLang: text('default_subs_lang').notNull().default('en'),
  mirrorArticleImages: integer('mirror_article_images', { mode: 'boolean' }).notNull().default(false),
});
export type Settings = typeof settings.$inferSelect;

export const tleCache = sqliteTable('tle_cache', {
  id: text('id').primaryKey(),
  satId: integer('sat_id').notNull(),
  name: text('name').notNull(),
  line1: text('line1').notNull(),
  line2: text('line2').notNull(),
  fetchedAt: integer('fetched_at').notNull().default(sql`(unixepoch())`),
});
export type TleEntry = typeof tleCache.$inferSelect;
