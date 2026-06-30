import type Database from 'better-sqlite3';

/**
 * Idempotent runtime migrations for existing databases. BOOTSTRAP_SQL only
 * uses CREATE TABLE IF NOT EXISTS (which never alters an existing table), so
 * column additions live here, guarded by PRAGMA table_info checks.
 *
 * New TABLES are added to BOOTSTRAP_SQL (for fresh installs) AND re-created
 * here with IF NOT EXISTS so an already-running DB picks them up too.
 */
export function runMigrations(sqlite: Database.Database): void {
  const ensureColumn = (table: string, column: string, ddl: string) => {
    const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    }
  };

  // Columns added after the initial release.
  ensureColumn('videos', 'topics', "topics TEXT NOT NULL DEFAULT '[]'");
  ensureColumn('videos', 'watch_later', 'watch_later INTEGER NOT NULL DEFAULT 0');
  ensureColumn('settings', 'setup_complete', 'setup_complete INTEGER NOT NULL DEFAULT 0');

  // Tables added after the initial release (also in BOOTSTRAP_SQL for fresh DBs).
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'planning',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS project_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS project_items_project_idx ON project_items(project_id);
    CREATE UNIQUE INDEX IF NOT EXISTS project_items_unique_idx
      ON project_items(project_id, item_type, item_id);

    CREATE TABLE IF NOT EXISTS datasheets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      part_number TEXT,
      manufacturer TEXT,
      source_url TEXT,
      file_path TEXT,
      notes TEXT,
      added_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS datasheets_added_idx ON datasheets(added_at DESC);
  `);

  // Full-text search index (FTS5 ships with better-sqlite3's bundled SQLite).
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      doc_type UNINDEXED,
      doc_id UNINDEXED,
      url UNINDEXED,
      title,
      body,
      tokenize = 'porter unicode61'
    );
  `);

  // ---- Addendum 3 roadmap tables ----
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS frequencies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      freq_hz INTEGER NOT NULL,
      mode TEXT,
      band TEXT,
      location TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS parts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      part_number TEXT,
      manufacturer TEXT,
      category TEXT,
      value TEXT,
      package TEXT,
      qty INTEGER NOT NULL DEFAULT 0,
      min_qty INTEGER NOT NULL DEFAULT 0,
      location TEXT,
      datasheet_id TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS qsos (
      id TEXT PRIMARY KEY,
      callsign TEXT NOT NULL,
      freq_mhz REAL,
      band TEXT,
      mode TEXT,
      qso_at INTEGER NOT NULL DEFAULT (unixepoch()),
      rst_sent TEXT,
      rst_rcvd TEXT,
      name TEXT,
      qth TEXT,
      grid TEXT,
      country TEXT,
      satellite TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS qsos_at_idx ON qsos(qso_at DESC);

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'blog',
      auto_archive INTEGER NOT NULL DEFAULT 1,
      last_polled_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS feed_items (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL,
      guid TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      audio_url TEXT,
      published_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE UNIQUE INDEX IF NOT EXISTS feed_items_guid_idx ON feed_items(feed_id, guid);

    CREATE TABLE IF NOT EXISTS video_bookmarks (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      t_seconds REAL NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS video_bookmarks_video_idx ON video_bookmarks(video_id, t_seconds);

    CREATE TABLE IF NOT EXISTS space_weather (
      id INTEGER PRIMARY KEY DEFAULT 1,
      sfi REAL,
      sunspots INTEGER,
      k_index REAL,
      a_index REAL,
      aurora_power REAL,
      source TEXT,
      fetched_at INTEGER,
      raw TEXT
    );

    CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY,
      pool TEXT NOT NULL,
      total INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      taken_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
}
