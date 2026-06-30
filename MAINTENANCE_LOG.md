# Maintenance Log

Autonomous maintenance pass on branch `claude/serene-knuth-rv5t2b`.
Date: 2026-06-30.

## Goal statement (derived)

Radio Resource Site is a self-hosted, distraction-free web app for radio
hobbyists (ham radio, satellites, radio astronomy, SDR), designed to run on
TrueNAS SCALE or any Docker host. It offline-archives YouTube videos (via a
SQLite-backed job queue + `yt-dlp` worker) and web articles (Readability +
DOMPurify), curates a tag-filterable resource hub, and ships static reference
tools (band plan, Q-codes, phonetic alphabet, callsign prefix lookup, satellite
pass prediction). Primary success criteria: it builds and runs cleanly as a
Docker stack (`web` + `worker`/`scheduler` sharing one SQLite DB), the
reference tools return correct data, and the experience stays accessible and
ad-free. This pass focused on reliability — keeping the project buildable in a
fresh environment and adding regression coverage to its untested core logic —
without changing any external behavior.

## Baseline

On entry: `pnpm typecheck`, `pnpm lint`, and `pnpm test` (17 tests) all passed.
`pnpm build` **failed** in this environment (see commit 3). No open issues or
PRs on the repository.

## Changes made (one entry per commit)

1. **`test: cover formatDuration/formatDate/formatRelative`**
   Added `tests/unit/format.test.ts`. `src/lib/format.ts` powers durations,
   archive dates, and "x min ago" timestamps across the UI but had zero tests.
   New tests cover the `m:ss` vs `h:mm:ss` branches, the null/negative/zero
   guards, and the relative-time thresholds. Behavior asserted matches the
   existing implementation exactly (verified against the real functions before
   writing assertions). No source changes.

2. **`test: cover azimuthCompass, buildIcs, and multi-satellite TLE parsing`**
   Extended `tests/unit/satellites.test.ts`. `azimuthCompass` and the ICS
   calendar export (`buildIcs`) were untested, and `parseTleBlock` was only
   exercised with a single 3-line block. Added coverage for the 8-point compass
   mapping including the 360°→N wrap, the `VCALENDAR`/`VEVENT` structure and
   AOS/LOS description line, an empty-calendar case, and multi-entry / stray-line
   TLE parsing. No source changes.

3. **`build: allow better-sqlite3 native build script under pnpm v10`**
   Added a `pnpm.onlyBuiltDependencies` allowlist to `package.json`. pnpm v10
   blocks dependency build scripts by default, so a fresh `pnpm install` never
   compiled `better-sqlite3`'s native addon; `pnpm build` and the worker then
   crashed with "Could not locate the bindings file" because `better-sqlite3`
   is the SQLite driver underpinning the entire data layer. With the allowlist
   the addon compiles on install and the production build completes. Build-config
   only — no source, API, schema, or runtime-behavior change. The only blocked
   build script in the project is `better-sqlite3`, so the allowlist is minimal
   and exact.

After the changes: `pnpm typecheck`, `pnpm lint`, `pnpm test` (32 tests, +15),
and `pnpm build` all pass.

## Deliberately NOT done

- **No drive-by refactors or reformatting.** Existing source style and data
  were left untouched.
- **No reference-data edits.** The band plan, Q-code, phonetic, and prefix
  tables look correct/consistent; "corrections welcome" notes mean changes are
  opinionated and best left to a human SME. Not touched.
- **No new tests for trivial data-only modules** (e.g. `q-codes.ts`) — that
  would be busywork, not regression value.
- **Did not modify any external-facing behavior** (streaming route, satellites
  API, ICS output). Genuine bugs found there are listed below for review rather
  than fixed, per the guardrails on external behavior / data formats.

## Proposed (needs review)

These are real defects I have moderate-to-high confidence in, but each changes
external behavior or an output data format, so they need your judgment.

1. **HTTP suffix-range requests mishandled** —
   `src/app/api/stream/[id]/route.ts`. The regex `bytes=(\d*)-(\d*)` treats a
   suffix range like `bytes=-500` ("last 500 bytes", used by some media players
   / download managers) as bytes `0–500`, serving the wrong content. Separately,
   a request whose end exceeds the file size returns `416` instead of clamping
   to `size-1` as RFC 7233 recommends, and `bytes=500-100` (end < start) isn't
   rejected (would yield a negative `Content-Length`). Low-risk fix exists but it
   alters streaming behavior — review before changing.

2. **ICS export is not RFC 5545 text-escaped** —
   `buildIcs` in `src/server/satellites/passes.ts`. `SUMMARY`/`DESCRIPTION`
   interpolate the satellite name and free text without escaping `,`, `;`, `\`,
   or newlines. A satellite name containing a comma would corrupt the `.ics`
   file in strict calendar clients. Current CelesTrak preset names happen to be
   comma-free, so impact is latent. Fix is a small escaping helper; it changes
   the exported data format, so flagged rather than applied.

3. **`hours` query param not validated against NaN** —
   `src/app/api/satellites/route.ts`. `Number(url.searchParams.get('hours') ?? 48)`
   yields `NaN` for non-numeric input (e.g. `?hours=abc`), which slips past the
   `Math.min/Math.max` clamp and makes `predictPasses` silently return zero
   passes. Suggest clamping `NaN` back to the default. External API surface →
   review.

4. **Channel-poll RSS title parsed but unused** —
   `src/server/jobs/handlers/channel-poll.ts` computes `titleMatch`/`TITLE_RE`
   but never uses the result, and channels with `autoDownload` disabled detect
   new videos but persist nothing about them. This reads like an incomplete
   feature (no "pending/new videos" surface) rather than a clear bug. Worth a
   product decision; not touched to avoid scope creep or a behavior change.

## Flags

- **Secrets:** none read, moved, or modified. No `.env`/key/token files were
  present in the working tree; `.gitignore` already excludes `data/` and
  `media/`. Nothing was touched near sensitive paths.
- **Pre-existing build break (now fixed):** the production build could not run
  in a clean environment before commit 3 (pnpm v10 native-build gate). This was
  environmental/config, not a source defect, and is resolved.
- **Pre-existing tests:** all green before and after.

## Status

All work is committed on branch `claude/serene-knuth-rv5t2b` (3 commits, plus
this log). `main` is untouched. `pnpm typecheck`, `pnpm lint`, `pnpm test`
(32 passing), and `pnpm build` all pass. Ready for your review and merge.
