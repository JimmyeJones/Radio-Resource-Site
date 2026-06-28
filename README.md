# Radio Resource Site

A self-hosted, distraction-free web app for everything radio: **ham radio, satellites, radio astronomy, SDR**. Pulls YouTube videos locally with `yt-dlp`, archives web articles into a clean reader, curates your link hub, and ships interactive reference tools (band plan, Q-codes, phonetic alphabet, callsign prefix lookup, satellite passes).

Built for [TrueNAS SCALE](https://www.truenas.com/truenas-scale/) (or any Docker host).

## Features

- **Offline YouTube library** — paste a URL, the background worker pulls it with `yt-dlp`. Watch with HTTP range-request streaming, captions, and keyboard shortcuts. No ads, no autoplay-next.
- **Channel subscriptions** — subscribe to a YouTube channel's RSS feed; new videos are detected on a 6-hour cron. Optional auto-download.
- **Web article archiver** — Readability extraction + DOMPurify sanitization. Reader view with serif/sans, light/sepia/dark themes, font-size controls, reading progress.
- **Curated resource hub** — searchable, tag-filterable directory of channels, blogs, references, tools. URL metadata auto-fill. JSON export/import for backups.
- **Reference tools**
  - US Amateur band plan (interactive segments, license-class filter)
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

## Deployment on TrueNAS SCALE

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
