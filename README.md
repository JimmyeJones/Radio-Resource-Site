# Radio Resource Site

A self-hosted, distraction-free web app for everything radio: **ham radio, satellites, radio astronomy, SDR**. Pulls YouTube videos locally with `yt-dlp`, archives web articles into a clean reader, curates your link hub, and ships interactive reference tools (band plan, Q-codes, phonetic alphabet, callsign prefix lookup, satellite passes).

Built for [TrueNAS SCALE](https://www.truenas.com/truenas-scale/) (or any Docker host).

## Features

- **Offline YouTube library** — paste a URL, the background worker pulls it with `yt-dlp`. Watch with HTTP range-request streaming, captions, and keyboard shortcuts. No ads, no autoplay-next.
- **Channel subscriptions** — subscribe to a YouTube channel's RSS feed; new videos are detected on a 6-hour cron. Optional auto-download.
- **Web article archiver** — Readability extraction + DOMPurify sanitization. Reader view with serif/sans, light/sepia/dark themes, font-size controls, reading progress.
- **First-run setup wizard** — seeds a curated catalog of channels (dereksgc, Saveitforparts, Phil's Lab, EEVblog, …) and reference links you toggle on; add your own too. Re-runnable from Settings.
- **Content filter** — downloaded videos are auto-tagged into topics (satellite, SDR, antenna, feed, PCB, ham, …) by keyword; filter the library with topic chips, or re-tag manually. "Backfill topics" re-classifies existing videos.
- **Curated resource hub** — searchable, tag-filterable directory of channels, blogs, references, tools. URL metadata auto-fill. JSON export/import for backups.
- **Project workspaces** — group videos, articles, hub links, and datasheets around a build (e.g. "L-band dish feed"), with a markdown notes/build-log.
- **Watch-later queue** — flag videos to watch; they drop off once you start watching.
- **Datasheet / PDF archiver** — fetch a datasheet by URL or upload a PDF; read it offline in an embedded viewer; link it to a project.
- **Full-text search** — one search box across videos (including transcripts from the `.vtt` subtitles), articles, hub links, datasheets, and projects, backed by SQLite FTS5.
- **Reference tools**
  - US Amateur band plan (interactive segments, license-class filter)
  - **Antenna & feed calculator** (dipole/vertical lengths, dish gain & geometry, circular-waveguide/feed-horn cutoff, coax loss)
  - **PCB calculator** (IPC-2221 trace current/width, microstrip/stripline impedance, via capacity)
  - **RF link budget** (path loss, link budget, dBm/watt & VSWR/return-loss conversions)
  - Q-codes table (searchable)
  - NATO/ITU phonetic alphabet + callsign speller
  - Callsign prefix lookup (country, CQ/ITU zones, continent)
  - Satellite passes (ISS, AO-91, SO-50, RS-44, NOAA-15/18/19, METEOR-M 2, plus any NORAD ID with cached TLEs)
- **Accessible** — semantic landmarks, skip-link, keyboard-first nav, ARIA radio groups, visible focus rings, honors `prefers-reduced-motion` and `prefers-color-scheme`.

## Architecture

Three processes share a SQLite database and two media volumes:

- `web` — Next.js 14 (App Router) on port 3000
- `worker` — drains the SQLite-backed job queue (`yt_download`, `article_archive`, `channel_poll`, `tle_refresh`)
- `scheduler` (inside the worker) — light `node-cron` loop that enqueues periodic jobs

Storage layout in the container:

| Path | Purpose |
| --- | --- |
| `/data/app.db` | SQLite database (videos, articles, hub items, jobs, settings, TLE cache) |
| `/media/youtube/<channel>/...` | Downloaded videos + thumbnails + `.vtt` subtitles + `.info.json` |
| `/media/articles/<id>/content.html` | Archived article body |

## Quick install (one-liner)

SSH into your NAS / Linux box (Docker required) and run:

```sh
curl -fsSL https://raw.githubusercontent.com/JimmyeJones/Radio-Resource-Site/claude/radio-content-web-app-7tby62/install.sh | bash
```

That clones the repo to `~/radio-resource-site`, builds the image, starts `web` + `worker`, and prints the URL when it's ready.

To put your data on a TrueNAS dataset instead of inside a Docker named volume (recommended — gets you snapshots and clean backups), pass `RADIO_DATA_DIR`:

```sh
curl -fsSL https://raw.githubusercontent.com/JimmyeJones/Radio-Resource-Site/claude/radio-content-web-app-7tby62/install.sh \
  | RADIO_DATA_DIR=/mnt/tank/radio bash
```

All knobs:

| Variable | Default | What it does |
| --- | --- | --- |
| `RADIO_INSTALL_DIR` | `$HOME/radio-resource-site` | Where the repo is cloned. |
| `RADIO_DATA_DIR` | _unset_ | Host path for SQLite DB + downloaded media. When set, the installer writes a `docker-compose.override.yml` with bind mounts; when unset, Docker named volumes are used. |
| `RADIO_PORT` | `3000` | Host port to expose the web UI on. |
| `RADIO_BRANCH` | `claude/radio-content-web-app-7tby62` | Git branch to track. |

Re-run the same one-liner anytime to pull updates and rebuild — the script is idempotent.

## Deployment on TrueNAS SCALE (manual)

1. Clone or copy this repository into a dataset on your NAS (e.g. `/mnt/tank/apps/radio-resource-site`).
2. Adjust `docker-compose.yml` if you want bind mounts to specific datasets instead of named volumes — for example:
   ```yaml
   volumes:
     - /mnt/tank/radio/data:/data
     - /mnt/tank/radio/media:/media
   ```
3. From the TrueNAS shell (or via the SCALE Apps → Custom App → Install via YAML form):
   ```sh
   docker compose up -d --build
   ```
4. Open `http://<your-nas>:3000`. The first request creates the DB and queues a TLE refresh in the background.
5. Visit **Settings** and enter your Maidenhead grid (or click "Use browser geolocation").

The `web` container exposes port `3000`. Put it behind your reverse proxy (Caddy / Traefik / Nginx Proxy Manager) if you want HTTPS or a hostname.

## Development

```sh
pnpm install
pnpm dev               # http://localhost:3000
pnpm worker            # background worker (yt-dlp + readability + scheduler)
pnpm typecheck
pnpm test
```

You need `yt-dlp` and `ffmpeg` on your `PATH` to download videos in dev:

```sh
# macOS
brew install yt-dlp ffmpeg
# Debian/Ubuntu
sudo apt install yt-dlp ffmpeg
```

> **Downloads failing with `HTTP Error 403: Forbidden`?** First, make sure
> `yt-dlp` is current — YouTube changes break older versions. The Docker image
> installs the latest release at build time, so on the NAS rebuild first:
> `docker compose up -d --build` (locally: `yt-dlp -U` / `pip install -U yt-dlp`).
>
> If it still 403s after updating, YouTube is bot-gating the download. Three
> optional env vars (honored by both the web and worker containers, no rebuild
> needed — just `docker compose up -d` after setting them) work around it:
>
> | Env var | What it does | Example |
> |---|---|---|
> | `YTDLP_COOKIES` | Path to a Netscape `cookies.txt` from a signed-in browser. **Most reliable fix.** Drop the file in your media dir (already mounted at `/media`). | `/media/cookies.txt` |
> | `YTDLP_PLAYER_CLIENT` | Use an alternate YouTube client. | `android` or `tv` |
> | `YTDLP_EXTRA_ARGS` | Any extra yt-dlp flags. | `--force-ipv4` |
>
> Export a `cookies.txt` with a browser extension (e.g. "Get cookies.txt
> LOCALLY"), copy it into your media dataset, then:
> ```sh
> YTDLP_COOKIES=/media/cookies.txt docker compose up -d
> ```

The SQLite database is created lazily at `./data/app.db`; media goes under `./media/`. Both are git-ignored.

## Adding to the hub

The hub ships empty by design. Use **Hub → Add item**:

- Paste a URL and click **Fill from page** to pre-populate the title and description from `og:` / `<meta>` tags.
- Pick a kind (channel, blog, reference, tool, podcast, forum, other) and tag it.
- Export the hub as JSON anytime; re-import on another instance.

## Notes & caveats

- **License**: this code is for your personal use. Respect YouTube's Terms of Service and only download content you have a right to download (e.g. your own uploads, Creative Commons material, or where local fair-use exemptions apply).
- The band plan is a simplified summary of FCC Part 97 / ARRL charts. Always verify current regulations before transmitting.
- Q-code, phonetic, and prefix tables are static reference data; corrections welcome.

73 and happy hacking.
