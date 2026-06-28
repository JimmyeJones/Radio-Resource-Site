import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

export const MEDIA_DIR = process.env.MEDIA_DIR ?? './media';
export const YT_DIR = join(MEDIA_DIR, 'youtube');
export const ARTICLE_DIR = join(MEDIA_DIR, 'articles');
export const THUMB_DIR = join(MEDIA_DIR, 'thumbnails');

export function ensureMediaDirs() {
  for (const dir of [MEDIA_DIR, YT_DIR, ARTICLE_DIR, THUMB_DIR]) {
    mkdirSync(dir, { recursive: true });
  }
}
