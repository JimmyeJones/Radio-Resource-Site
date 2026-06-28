// CLI helper: open the DB and run the bootstrap SQL. The same SQL also runs
// automatically on first DB access via client.ts, so this script is only
// useful for "warm me up before the first request" use cases.
import { rawDb } from './client';

export function migrate() {
  // touching rawDb triggers open() which runs BOOTSTRAP_SQL.
  rawDb.pragma('user_version');
}

if (require.main === module) {
  migrate();
  console.log('migrations applied');
  process.exit(0);
}
