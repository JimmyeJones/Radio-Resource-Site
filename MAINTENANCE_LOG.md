# Maintenance Log

Autonomous maintenance pass on `claude/wonderful-bardeen-ajdadx`.
Date: 2026-06-30.

## Goal statement (derived)

Radio Resource Site is a self-hosted, single-user web app (Next.js 14 App
Router + a SQLite-backed worker) that gives radio hobbyists — ham, satellite,
radio astronomy, SDR — a distraction-free home for their content: an offline
YouTube library pulled with `yt-dlp`, a Readability-based web-article archiver,
a curated link hub, and a set of interactive reference tools (US band plan,
Q-codes, NATO phonetics, callsign-prefix lookup, satellite-pass prediction).
Primary success criteria are that it deploys cleanly on a Docker/TrueNAS host,
keeps working offline, and that the reference data and conversions are correct
and trustworthy. There is no public API surface or multi-user concern, so the
maintenance priorities are correctness, reliability, and test coverage of the
pure logic — without changing any external behavior or data formats.

Confidence in this goal is high: the README, architecture section, the
package/build manifests, and the code itself are consistent and unambiguous.

## Baseline (before changes)

- `pnpm typecheck` — clean
- `pnpm lint` — clean
- `pnpm test` — 17 tests passing (4 files)
- `pnpm build` — passes **once the `better-sqlite3` native binding is
  compiled** (see Flagged items)
- No open GitHub issues or PRs.

## Changes made (one per commit)

1. **test: cover format helpers (duration, date, relative time)**
   `src/lib/format.ts` powers duration/date/relative-time rendering across the
   video and article UIs but had zero tests. Added `tests/unit/format.test.ts`
   covering `formatDuration` (`m:ss` vs `h:mm:ss`, plus null/zero/negative
   guards), `formatDate` (null guard + valid timestamp), and `formatRelative`
   (just-now / minutes / hours / days / absolute-date fallback). Test-only; no
   production code touched.

2. **test: cover isYouTubeUrl host validation**
   `isYouTubeUrl` (in `src/server/ytdlp.ts`) is the gate that decides which URLs
   the downloader will accept, so its host-matching is security-relevant and
   worth pinning down. Added `tests/unit/youtube-url.test.ts` confirming it
   accepts canonical hosts (`youtube.com`, `m.`/`music.` subdomains, `youtu.be`)
   and rejects look-alikes (`youtube.com.evil.example`), other hosts, and
   non-URL input. Test-only.

Test count after changes: **29 passing (6 files)**. Typecheck, lint, and a full
`next build` (with the native binding compiled) all pass.

## Deliberately NOT done

The codebase is small, clean, consistently styled, and already tested where it
matters most. I made no behavior changes, no refactors, no dependency changes,
and no reformatting. Everything below is left for human review rather than
changed autonomously, because each either alters external behavior, is
architectural, or is low enough value that touching it would just be churn.

### Proposed (needs review)

1. **HTTP suffix-range handling in `src/app/api/stream/[id]/route.ts`.**
   A `Range: bytes=-500` request (the HTTP spec's "last 500 bytes" form) is
   currently parsed as `start=0, end=500`, i.e. it serves the *first* 501 bytes
   instead of the last 500. Real video players almost never send suffix ranges,
   so impact is low, but it is a spec deviation. Fixing it changes externally
   observable HTTP behavior, so it belongs on this list rather than in an
   autonomous edit. Would pair with a focused test.

2. **Server-side fetch of arbitrary user URLs (SSRF surface).**
   `fetchAndExtract` (`src/server/readability.ts`) and the hub "Fill from page"
   metadata fetch will fetch any URL the user submits from the server, with no
   host allow/deny list. For a single-user, self-hosted app behind the user's
   own network this is largely acceptable, but a user could point it at
   internal/loopback/metadata endpoints. Adding SSRF guards is a behavior change
   and a judgement call about the threat model, so flagging rather than acting.

3. **`azimuthCompass` negative-input guard (`src/server/satellites/passes.ts`).**
   `dirs[Math.round(deg / 45) % 8]` returns `undefined` for negative degrees.
   It is currently only ever called with azimuths already normalized to
   `[0, 360)`, so this is *not* a live bug — but a one-line `((x % 8) + 8) % 8`
   would make the exported helper safe for any caller. Low value; left to review.

4. **Dead code in `src/server/jobs/handlers/channel-poll.ts`.**
   `TITLE_RE` / `titleMatch` are computed inside the entry loop but never used
   (titles are resolved later via `yt-dlp`). Harmless. Removing it is pure
   cleanup with no functional effect; left out to avoid churn unless a reviewer
   wants it gone.

5. **Continuous integration.**
   There is no CI workflow running `typecheck` / `lint` / `test` on pushes and
   PRs. Adding one would be valuable and low-behavioral-risk, but a working
   workflow must also handle the `better-sqlite3` native build step (see below),
   which I could not validate end-to-end in this environment. Recommended as a
   follow-up rather than a guessed-at config that might be red on first run.

## Flagged

- **`pnpm install` ignores the `better-sqlite3` build script** (a pnpm security
  default), leaving the native binding uncompiled, which makes `pnpm build`
  fail at "collect page data". This is an **environment/tooling artifact, not a
  code defect** — the production `Dockerfile` is responsible for compiling it,
  and once the binding is built locally the full `next build` succeeds. Noted
  here so a reviewer running the build locally knows to run the equivalent of
  `pnpm approve-builds` / rebuild `better-sqlite3` first. No repo change made.
- **No secrets, credentials, `.env` files, keys, or tokens** were found,
  touched, read, or printed during this pass.

## Status

All work is committed on branch `claude/wonderful-bardeen-ajdadx` (two
test-only commits plus this log) and pushed, ready for review and merge.
Nothing was committed to `main`. Test suite: 29 passing. Typecheck, lint, and
build all green.
