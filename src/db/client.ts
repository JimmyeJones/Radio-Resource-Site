import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const dbPath = process.env.DATABASE_PATH ?? './data/app.db';

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
}

function open() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  return sqlite;
}

const sqlite = global.__sqlite ?? open();
if (process.env.NODE_ENV !== 'production') global.__sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export const rawDb = sqlite;
export { schema };
