# Maintenance Log

Autonomous maintenance pass on branch `claude/serene-knuth-q15348`.
Date: 2026-06-30.

## Goal statement (derived)

Radio Resource Site is a self-hosted, distraction-free web app for radio
hobbyists (ham radio, satellites, radio astronomy, SDR). It provides an
offline YouTube library (downloaded locally via `yt-dlp` through a
SQLite-backed job queue), a Readability-based web-article archiver with a
clean reader, a curated link hub, and a set of interactive reference tools
(US band plan, Q-codes, NATO phonetics, callsign prefix lookup, satellite
pass prediction). It is built with Next.js 14 (App Router) + better-sqlite3
+ Drizzle and ships with a Dockerfile/compose for TrueNAS SCALE. Primary
success criteria: a correct, accessible, reliably self-hostable app where
each tool returns accurate results and the background worker reliably
downloads and archives content. There are no docs/ROADMAP/TODO files and no
open issues; the goal was inferred from the README, manifests, and code.

## Baseline

Before any change, on a clean tree: `pnpm typecheck`, `pnpm test`
(17 tests), `pnpm lint`, and `pnpm build` all passed. (`better-sqlite3`
required a native rebuild in this environment; that is a local dev-setup
step, not a repo change.)

## Changes made (one per commit)

1. **`test: add unit tests for format helpers`**
   `src/lib/format.ts` (`formatDuration`, `formatDate`, `formatRelative`) is
   used across the video/article UI but had zero coverage. Added focused
   tests for the null/zero/negative guards, the sub-hour vs hour-plus
   duration branches, fractional-second truncation, and the relative-time
   thresholds. Assertions avoid locale-dependent output so they are stable
   across runners. No production code changed.

2. **`test: cover satellite pass helpers (azimuthCompass, buildIcs)`**
   `azimuthCompass` and the `buildIcs` ICS-calendar export in
   `src/server/satellites/passes.ts` had no coverage. Added tests for the
   compass mapping (including the 350/360 wrap back to North) and for the
   ICS output (VCALENDAR/VEVENT structure, UID, UTC `DTSTART`/`DTEND`
   formatting, CRLF line endings, one event per pass), plus a 4-char
   Maidenhead round-trip for `latLonToGrid`. No production code changed.

3. **`fix: return 416 for inverted video Range requests instead of crashing`**
   Real bug. In `src/app/api/stream/[id]/route.ts`, a Range header whose
   start exceeds its end (e.g. `bytes=100-50`) passed the
   `start >= size || end >= size` check and reached
   `createReadStream({ start, end })`, which throws a synchronous
   `ERR_OUT_OF_RANGE` (verified empirically) and turns the request into a
   500. Extracted the parsing/validation into a pure `resolveByteRange`
   helper (`src/lib/range.ts`) that also rejects `start > end` as
   unsatisfiable, and updated the route to use it. Behavior for well-formed
   and existing out-of-bounds requests is byte-for-byte unchanged (same two
   416 responses); only the previously-crashing inverted range now returns a
   proper 416. Added unit tests for normal, open-ended, malformed,
   out-of-bounds, and inverted ranges.

After every commit: `pnpm typecheck`, `pnpm test` (now 38 tests),
`pnpm lint`, and `pnpm build` all pass.

## Deliberately NOT done

- **`formatDuration(0)` returns `''` instead of `'0:00'`** (flagged by the
  audit). Judged to be *intended* behavior: a `0`/unknown duration should
  hide the duration badge rather than render a misleading `0:00`. Changing it
  is a behavior change with no clear benefit, so it was left as-is and the
  current behavior is now pinned by a test.
- **No drive-by refactors, reformatting, dependency changes, or schema/API
  changes.** None were required.
- **`spellPhonetic` edge branches** (space → `(space)`, digit `9` → `Niner`)
  were left untested — marginal value, not worth the churn.

## Proposed (needs review)

1. **Article archiver orphans a media directory when a job is retried.**
   `src/server/jobs/handlers/article-archive.ts` generates a fresh
   `randomUUID()` and creates `media/articles/<uuid>/` *before* looking up
   whether the source URL already has a row. On a retry (or a re-archive of
   the same URL), it finds the existing row and updates it, but `htmlPath`
   now points at the new directory while the old directory is left on disk —
   a disk leak, and the directory name no longer matches the article id.
   *Suggested fix* (small, but touches the untested worker pipeline, so it
   wants review + an integration test): look up `existing` first and derive
   the id from it, so the same URL always reuses the same directory:

   ```ts
   const existing = db.select().from(articles).where(eq(articles.sourceUrl, url)).get();
   const id = existing?.id ?? randomUUID();
   const dir = join(ARTICLE_DIR, id);   // re-archive overwrites in place
   ```

   Not auto-applied because the worker handler has no test harness
   (it does a live network fetch + fs writes + DB writes), so verifying it
   safely needs a focused integration test and a choice of fix strategy
   (overwrite-in-place vs. clean up the old directory).

2. **Suffix byte ranges (`bytes=-500`) are misinterpreted.** The stream
   route's regex treats `bytes=-500` as start=0/end=500 rather than "last 500
   bytes". Browsers don't send suffix ranges for `<video>`, so impact is low;
   noted for completeness. Would be a behavior change to the streaming
   contract, so left for review rather than changed silently.

## Flags

- **No secrets touched.** `.env`/credentials were not read, moved, or
  printed. None were found in the tree.
- **Pre-existing broken tests:** none. The suite was green at baseline and
  remains green (38 tests).
- **Native build note:** `better-sqlite3` needed `npm rebuild better-sqlite3`
  to run tests/build in this fresh container. This is environment setup, not
  a repo defect.

## Status

All work is committed on `claude/serene-knuth-q15348` (3 commits + this
log). Nothing was pushed to `main`. Typecheck, tests, lint, and build all
pass. Ready for review and merge.
