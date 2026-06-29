import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { BOOTSTRAP_SQL } from './bootstrap-sql';
import { runMigrations } from './migrations';

const dbPath = process.env.DATABASE_PATH ?? './data/app.db';

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __drizzle: BetterSQLite3Database<typeof schema> | undefined;
}

function open(): { raw: Database.Database; drz: BetterSQLite3Database<typeof schema> } {
  if (globalThis.__sqlite && globalThis.__drizzle) {
    return { raw: globalThis.__sqlite, drz: globalThis.__drizzle };
  }
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  // busy_timeout must come BEFORE journal_mode so the WAL switch can wait
  // for a peer connection instead of throwing SQLITE_BUSY immediately.
  sqlite.pragma('busy_timeout = 10000');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(BOOTSTRAP_SQL);
  runMigrations(sqlite);
  const drz = drizzle(sqlite, { schema });
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__sqlite = sqlite;
    globalThis.__drizzle = drz;
  }
  return { raw: sqlite, drz };
}

// Lazy proxies — the SQLite handle is opened on first use, not at module load,
// so `next build`'s page-data collection phase never touches the file.
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_t, prop) {
    const { drz } = open();
    const v = (drz as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(drz) : v;
  },
});

export const rawDb = new Proxy({} as Database.Database, {
  get(_t, prop) {
    const { raw } = open();
    const v = (raw as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(raw) : v;
  },
});

export { schema };
