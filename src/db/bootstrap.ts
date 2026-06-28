import { migrate } from './migrate';

// Kept for callers (e.g. the worker entrypoint) that want to force the DB
// open up-front. The proxy in client.ts also bootstraps on first access, so
// this is purely a convenience.
export function ensureDb() {
  migrate();
}
