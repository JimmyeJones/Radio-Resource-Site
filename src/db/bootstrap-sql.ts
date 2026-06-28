// Bootstrap SQL — applied idempotently the first time the SQLite handle is
// opened. Living here (rather than in migrate.ts) avoids the cycle:
//   client.ts → migrate.ts → client.rawDb → client.ts (would re-trigger open())
export const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  channel TEXT,
  channel_id TEXT,
  description TEXT,
  duration_s INTEGER,
  published_at INTEGER,
  file_path TEXT,
  thumbnail_path TEXT,
  subs_path TEXT,
  info_json_path TEXT,
  added_at INTEGER NOT NULL DEFAULT (unixepoch()),
  watched_at INTEGER,
  progress_s INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS videos_added_idx ON videos(added_at DESC);
CREATE INDEX IF NOT EXISTS videos_channel_idx ON videos(channel_id);

CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rss_url TEXT NOT NULL,
  last_polled_at INTEGER,
  auto_download INTEGER NOT NULL DEFAULT 0,
  added_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  byline TEXT,
  site_name TEXT,
  excerpt TEXT,
  html_path TEXT NOT NULL,
  published_at INTEGER,
  archived_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read_at INTEGER,
  word_count INTEGER NOT NULL DEFAULT 0,
  lang TEXT
);
CREATE INDEX IF NOT EXISTS articles_archived_idx ON articles(archived_at DESC);

CREATE TABLE IF NOT EXISTS hub_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'other',
  tags TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS hub_kind_idx ON hub_items(kind);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  progress REAL NOT NULL DEFAULT 0,
  message TEXT,
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  started_at INTEGER,
  finished_at INTEGER
);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status, created_at);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  qth_grid TEXT,
  qth_lat REAL,
  qth_lon REAL,
  qth_elevation_m REAL DEFAULT 0,
  theme TEXT NOT NULL DEFAULT 'system',
  download_format_code TEXT NOT NULL DEFAULT 'bv*+ba/b',
  max_height INTEGER NOT NULL DEFAULT 1080,
  default_subs_lang TEXT NOT NULL DEFAULT 'en',
  mirror_article_images INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS tle_cache (
  id TEXT PRIMARY KEY,
  sat_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT NOT NULL,
  fetched_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;
