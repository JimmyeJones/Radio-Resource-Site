import { describe, it, expect, afterEach } from 'vitest';
import { commonArgs, isYouTubeUrl } from '@/server/ytdlp';

const SAVED = {
  YTDLP_COOKIES: process.env.YTDLP_COOKIES,
  YTDLP_PLAYER_CLIENT: process.env.YTDLP_PLAYER_CLIENT,
  YTDLP_EXTRA_ARGS: process.env.YTDLP_EXTRA_ARGS,
};

afterEach(() => {
  for (const [k, v] of Object.entries(SAVED)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe('commonArgs (yt-dlp 403 workarounds)', () => {
  it('is empty when no env vars are set', () => {
    delete process.env.YTDLP_COOKIES;
    delete process.env.YTDLP_PLAYER_CLIENT;
    delete process.env.YTDLP_EXTRA_ARGS;
    expect(commonArgs()).toEqual([]);
  });

  it('adds a player client as an extractor arg', () => {
    delete process.env.YTDLP_COOKIES;
    process.env.YTDLP_PLAYER_CLIENT = 'android';
    delete process.env.YTDLP_EXTRA_ARGS;
    expect(commonArgs()).toEqual(['--extractor-args', 'youtube:player_client=android']);
  });

  it('splits extra args on whitespace', () => {
    delete process.env.YTDLP_COOKIES;
    delete process.env.YTDLP_PLAYER_CLIENT;
    process.env.YTDLP_EXTRA_ARGS = '--force-ipv4 --geo-bypass';
    expect(commonArgs()).toEqual(['--force-ipv4', '--geo-bypass']);
  });

  it('ignores a cookies path that does not exist', () => {
    process.env.YTDLP_COOKIES = '/definitely/not/here/cookies.txt';
    delete process.env.YTDLP_PLAYER_CLIENT;
    delete process.env.YTDLP_EXTRA_ARGS;
    expect(commonArgs()).toEqual([]);
  });
});

describe('isYouTubeUrl', () => {
  it('accepts canonical hosts and rejects look-alikes', () => {
    expect(isYouTubeUrl('https://youtu.be/abc')).toBe(true);
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isYouTubeUrl('https://youtube.com.evil.example/x')).toBe(false);
  });
});
