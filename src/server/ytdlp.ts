import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

export interface YtDlpInfo {
  id: string;
  title: string;
  channel?: string;
  channel_id?: string;
  description?: string;
  duration?: number;
  upload_date?: string;
  thumbnail?: string;
  webpage_url?: string;
}

const BIN = process.env.YT_DLP ?? 'yt-dlp';

/**
 * Args applied to every yt-dlp call, driven by optional env vars so YouTube
 * bot-detection (HTTP 403) can be worked around without a rebuild:
 *   YTDLP_COOKIES        path to a Netscape cookies.txt (e.g. /media/cookies.txt)
 *   YTDLP_PLAYER_CLIENT  yt-dlp youtube player_client, e.g. "android" or "tv"
 *   YTDLP_EXTRA_ARGS     any extra space-separated flags (e.g. "--force-ipv4")
 */
export function commonArgs(): string[] {
  const args: string[] = [];
  const cookies = process.env.YTDLP_COOKIES;
  if (cookies && existsSync(cookies)) args.push('--cookies', cookies);
  const client = process.env.YTDLP_PLAYER_CLIENT;
  if (client) args.push('--extractor-args', `youtube:player_client=${client}`);
  const extra = process.env.YTDLP_EXTRA_ARGS?.trim();
  if (extra) args.push(...extra.split(/\s+/));
  return args;
}

export async function fetchInfo(url: string): Promise<YtDlpInfo> {
  return await runJson([...commonArgs(), '--no-warnings', '--skip-download', '-J', url]);
}

export interface DownloadOptions {
  url: string;
  outDir: string;
  formatCode?: string; // default: bv*+ba/b
  maxHeight?: number;
  subsLang?: string;
  onProgress?: (pct: number, msg?: string) => void;
}

const PROGRESS_RE = /^PROGRESS\s+(\d+)\s+(\d+)\s+(.*)$/;

export async function downloadVideo(opts: DownloadOptions): Promise<{ filePath: string; infoJsonPath: string; thumbPath?: string; subsPath?: string; info: YtDlpInfo }> {
  const heightFilter = opts.maxHeight ? `[height<=${opts.maxHeight}]` : '';
  const fmt = opts.formatCode ?? `bv*${heightFilter}+ba/b${heightFilter}`;
  const args = [
    ...commonArgs(),
    '--no-warnings',
    '--no-playlist',
    '-f',
    fmt,
    '--merge-output-format',
    'mp4',
    '--write-info-json',
    '--write-thumbnail',
    '--convert-thumbnails',
    'jpg',
    '--write-subs',
    '--write-auto-subs',
    '--sub-lang',
    opts.subsLang ?? 'en',
    '--convert-subs',
    'vtt',
    '--restrict-filenames',
    '-o',
    `${opts.outDir}/%(channel)s/%(title).80B [%(id)s].%(ext)s`,
    '--newline',
    '--progress-template',
    'PROGRESS %(progress.downloaded_bytes)s %(progress.total_bytes_estimate,progress.total_bytes)s %(info.title)s',
    '--print',
    'after_move:FILE %(filepath)s',
    '--print',
    'after_move:INFO %(info_json_filename)s',
    '--print',
    'after_move:THUMB %(thumbnails.-1.filepath)s',
    '--print',
    'after_move:SUB %(subtitles.en.0.filepath)s',
    opts.url,
  ];

  let filePath = '';
  let infoJsonPath = '';
  let thumbPath: string | undefined;
  let subsPath: string | undefined;
  let stderr = '';

  await new Promise<void>((resolve, reject) => {
    const child = spawn(BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    child.stdout.on('data', (chunk: Buffer) => {
      buf += chunk.toString();
      let nl: number;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const m = line.match(PROGRESS_RE);
        if (m) {
          const downloaded = Number(m[1]);
          const total = Number(m[2]);
          const pct = total > 0 ? (downloaded / total) * 100 : 0;
          opts.onProgress?.(Math.min(99, pct), m[3]);
          continue;
        }
        if (line.startsWith('FILE ')) filePath = line.slice(5);
        else if (line.startsWith('INFO ')) infoJsonPath = line.slice(5);
        else if (line.startsWith('THUMB ') && line.length > 6 && line.slice(6) !== 'NA') thumbPath = line.slice(6);
        else if (line.startsWith('SUB ') && line.length > 4 && line.slice(4) !== 'NA') subsPath = line.slice(4);
      }
    });
    child.stderr.on('data', (c: Buffer) => {
      stderr += c.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited ${code}: ${stderr.slice(-500)}`));
    });
  });

  if (!filePath) throw new Error('yt-dlp did not report a file path');

  const info = await fetchInfo(opts.url).catch(() => ({ id: '', title: filePath }) as YtDlpInfo);
  return { filePath, infoJsonPath, thumbPath, subsPath, info };
}

async function runJson<T>(args: string[]): Promise<T> {
  let out = '';
  let err = '';
  await new Promise<void>((resolve, reject) => {
    const child = spawn(BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (c: Buffer) => (out += c.toString()));
    child.stderr.on('data', (c: Buffer) => (err += c.toString()));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err || `yt-dlp exited ${code}`))));
  });
  return JSON.parse(out) as T;
}

export function isYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname);
  } catch {
    return false;
  }
}
