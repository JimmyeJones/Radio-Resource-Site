# Maintenance Log

Autonomous maintenance pass on `claude/serene-knuth-qzertk`. Date: 2026-06-30.

## Goal statement

Radio Resource Site is a self-hosted, distraction-free web app for radio
hobbyists (ham radio, satellites, radio astronomy, SDR). It offers an offline
yt-dlp-backed YouTube library with ad-free playback, a Readability-based web
article archiver, a curated link hub, and a set of interactive reference tools
(US band plan, Q-codes, NATO phonetics, callsign-prefix lookup, satellite
passes). It is a Next.js 14 + SQLite (better-sqlite3 / Drizzle) app with a
companion worker process draining a database-backed job queue, packaged for
Docker / TrueNAS SCALE deployment. Primary success criteria: correct and
trustworthy reference data and computations, reliable media/article handling,
strong accessibility, and an easy self-hosted deployment.

## Baseline

On a clean checkout the project was already healthy: `tsc --noEmit` (typecheck),
`vitest run` (17 tests), and `next lint` all passed. There are no open GitHub
issues and no docs/, CONTRIBUTING, or ROADMAP files — the goal was derived from
the README, `package.json`, the Dockerfile/compose, and the commit history.

The work below is deliberately conservative: the codebase is mature and green,
so the highest-confidence, lowest-risk improvement was to close gaps in the
existing test suite for pure, user-facing logic. No production code was changed.

## Changes made (one per commit)

1. **test: cover format.ts duration/date helpers** — `src/lib/format.ts`
   (`formatDuration`, `formatDate`, `formatRelative`) drives the video lengths
   and timestamps shown throughout the library UI but had zero test coverage.
   Added `tests/unit/format.test.ts` covering the `m:ss` / `h:mm:ss` formatting,
   the null/negative guards, and the relative-time buckets.

2. **test: add integrity checks for the Q-code table** — the Q-code reference
   data behind `/tools/q-codes` had no tests. Added `tests/unit/q-codes.test.ts`
   asserting the common operating codes are present, every entry is a
   well-formed three-letter `Q__` code with non-empty question and statement
   text, and there are no duplicate codes. Guards the README's invitation that
   "corrections welcome" against silent malformed/duplicate edits.

3. **test: cover multi-record TLE parsing and azimuthCompass** — `parseTleBlock`
   was only exercised on a single 3-line block, but the real CelesTrak feeds
   return many satellites per response (the production code path). Extended
   `tests/unit/satellites.test.ts` with a multi-record parse test, a
   no-elements case, and direct coverage for `azimuthCompass` including the
   360°→N wrap-around.

Test count went from 17 to 30; typecheck, tests, and lint all remain green.

## What I deliberately did NOT do

Per the guardrails I avoided anything that changes external behavior, public
APIs/data formats, or that needed a judgment call I could not make safely. The
following are recorded for your review rather than acted on:

### Proposed (needs review)

1. **HTTP suffix range requests are mishandled in the video stream route**
   (`src/app/api/stream/[id]/route.ts`). The regex `/bytes=(\d*)-(\d*)/` treats
   `Range: bytes=-500` (RFC 7233 "last 500 bytes") as `start=0, end=500` instead
   of `start=size-500, end=size-1`. Most `<video>` clients send `bytes=START-`
   so this is latent, but it is a genuine spec violation. A safe fix would also
   reject `start > end` (e.g. `bytes=500-100`, which currently yields a negative
   `Content-Length`). Left on Proposed because it changes externally observable
   HTTP behavior on an untested route. Recommended approach: extract the range
   math into a pure helper and unit-test it, then wire it in.

2. **The `ReadableStream` adapter ignores backpressure**
   (`toWebStream` in the same file). It pushes every `fs` chunk via
   `controller.enqueue` without honoring `controller.desiredSize` / the stream's
   `pull` signal, so a fast disk + slow client buffers the whole range in memory.
   Behavior change to a hot path — needs review and a load test, not a blind edit.

3. **No CI / SessionStart hook.** There is no `.github/workflows` running
   typecheck + lint + tests on PRs, and no SessionStart hook for web sessions.
   Adding CI would protect the suite this pass extended, but it is infra /
   opinionated and outside a code improvement, so it is left for your decision.
   (A `session-start-hook` skill exists if you want help wiring one up.)

4. **Coverage still thin in a few areas.** `latLonToGrid`, `buildIcs`,
   `predictPasses` numerical output, and the `parsePrefix` portable-suffix
   stripping have only light or indirect coverage. Further tests are low-risk
   but were left out of this pass to avoid scope creep beyond the clear gaps.

## Flagged

- **Secrets:** none were read, edited, or printed. No `.env` files are committed;
  `.gitignore` already excludes `.env*`, `data/`, and `media/`. Not touched.
- **Risky areas:** the video stream route (items 1–2 above) is the most
  behavior-sensitive code in the repo and is currently untested — treat changes
  there carefully.
- **Pre-existing broken tests:** none. The suite was green before and after.
- **Tooling note:** `pnpm <script>` triggers a dependency-status check that errors
  because `better-sqlite3`'s build script is unapproved in this sandbox
  (`ERR_PNPM_IGNORED_BUILDS`). Tests/typecheck/lint were therefore run via the
  local binaries directly (`./node_modules/.bin/{vitest,tsc,next}`); the unit
  tests do not require the native module. This is an environment quirk, not a
  repo defect.

## Status

All changes are committed on branch `claude/serene-knuth-qzertk` (three
test-only commits plus this log). Nothing was pushed to `main`. Ready for your
review and merge.
