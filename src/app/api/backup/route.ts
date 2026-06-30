import { rawDb } from '@/db/client';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const dynamic = 'force-dynamic';

// Stream a consistent snapshot of the SQLite database. better-sqlite3's
// backup() produces a coherent copy even while the DB is in use (WAL mode).
export async function GET() {
  const dir = mkdtempSync(join(tmpdir(), 'rrs-backup-'));
  const out = join(dir, 'app.db');
  try {
    await rawDb.backup(out);
    const buf = readFileSync(out);
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="radio-backup-${new Date().toISOString().slice(0, 10)}.db"`,
        'Content-Length': String(buf.length),
      },
    });
  } catch (err) {
    return new Response(`backup failed: ${err instanceof Error ? err.message : String(err)}`, { status: 500 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
