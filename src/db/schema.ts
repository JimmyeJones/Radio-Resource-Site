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
  topics: text('topics', { mode: 'json' }).$type<string[]>().notNull().default([]),
  watchLater: integer('watch_later', { mode: 'boolean' }).notNull().default(false),
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
    enum: [
      'yt_download',
      'article_archive',
      'channel_poll',
      'tle_refresh',
      'datasheet_fetch',
      'datasheet_lookup',
      'feed_poll',
      'space_weather_refresh',
    ],
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
  setupComplete: integer('setup_complete', { mode: 'boolean' }).notNull().default(false),
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

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['planning', 'active', 'done', 'archived'] })
    .notNull()
    .default('planning'),
  notes: text('notes').notNull().default(''),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectItems = sqliteTable('project_items', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  itemType: text('item_type', {
    enum: ['video', 'article', 'hub', 'datasheet', 'part', 'note'],
  }).notNull(),
  itemId: text('item_id').notNull(),
  note: text('note'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type ProjectItem = typeof projectItems.$inferSelect;

export const datasheets = sqliteTable('datasheets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  partNumber: text('part_number'),
  manufacturer: text('manufacturer'),
  sourceUrl: text('source_url'),
  filePath: text('file_path'),
  notes: text('notes'),
  addedAt: integer('added_at').notNull().default(sql`(unixepoch())`),
});
export type Datasheet = typeof datasheets.$inferSelect;
export type NewDatasheet = typeof datasheets.$inferInsert;

export const frequencies = sqliteTable('frequencies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  freqHz: integer('freq_hz').notNull(),
  mode: text('mode'),
  band: text('band'),
  location: text('location'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  notes: text('notes'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type Frequency = typeof frequencies.$inferSelect;
export type NewFrequency = typeof frequencies.$inferInsert;

export const parts = sqliteTable('parts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  partNumber: text('part_number'),
  manufacturer: text('manufacturer'),
  category: text('category'),
  value: text('value'),
  pkg: text('package'),
  qty: integer('qty').notNull().default(0),
  minQty: integer('min_qty').notNull().default(0),
  location: text('location'),
  datasheetId: text('datasheet_id'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;

export const qsos = sqliteTable('qsos', {
  id: text('id').primaryKey(),
  callsign: text('callsign').notNull(),
  freqMhz: real('freq_mhz'),
  band: text('band'),
  mode: text('mode'),
  qsoAt: integer('qso_at').notNull().default(sql`(unixepoch())`),
  rstSent: text('rst_sent'),
  rstRcvd: text('rst_rcvd'),
  name: text('name'),
  qth: text('qth'),
  grid: text('grid'),
  country: text('country'),
  satellite: text('satellite'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type Qso = typeof qsos.$inferSelect;
export type NewQso = typeof qsos.$inferInsert;

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const feeds = sqliteTable('feeds', {
  id: text('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  kind: text('kind', { enum: ['blog', 'podcast'] }).notNull().default('blog'),
  autoArchive: integer('auto_archive', { mode: 'boolean' }).notNull().default(true),
  lastPolledAt: integer('last_polled_at'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type Feed = typeof feeds.$inferSelect;

export const feedItems = sqliteTable('feed_items', {
  id: text('id').primaryKey(),
  feedId: text('feed_id').notNull(),
  guid: text('guid').notNull(),
  title: text('title').notNull(),
  url: text('url'),
  audioUrl: text('audio_url'),
  publishedAt: integer('published_at'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type FeedItem = typeof feedItems.$inferSelect;

export const videoBookmarks = sqliteTable('video_bookmarks', {
  id: text('id').primaryKey(),
  videoId: text('video_id').notNull(),
  tSeconds: real('t_seconds').notNull(),
  label: text('label').notNull().default(''),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});
export type VideoBookmark = typeof videoBookmarks.$inferSelect;

export const spaceWeather = sqliteTable('space_weather', {
  id: integer('id').primaryKey().default(1),
  sfi: real('sfi'),
  sunspots: integer('sunspots'),
  kIndex: real('k_index'),
  aIndex: real('a_index'),
  auroraPower: real('aurora_power'),
  source: text('source'),
  fetchedAt: integer('fetched_at'),
  raw: text('raw', { mode: 'json' }).$type<Record<string, unknown>>(),
});
export type SpaceWeather = typeof spaceWeather.$inferSelect;

export const examAttempts = sqliteTable('exam_attempts', {
  id: text('id').primaryKey(),
  pool: text('pool').notNull(),
  total: integer('total').notNull(),
  correct: integer('correct').notNull(),
  takenAt: integer('taken_at').notNull().default(sql`(unixepoch())`),
});
export type ExamAttempt = typeof examAttempts.$inferSelect;
