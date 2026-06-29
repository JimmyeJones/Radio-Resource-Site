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
}
