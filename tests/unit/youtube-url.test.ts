import { describe, it, expect } from 'vitest';
import { isYouTubeUrl } from '@/server/ytdlp';

describe('isYouTubeUrl', () => {
  it('accepts canonical YouTube hosts', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  });

  it('rejects look-alike hostnames that merely contain the domain', () => {
    expect(isYouTubeUrl('https://notyoutube.com/watch?v=x')).toBe(false);
    expect(isYouTubeUrl('https://youtube.com.evil.example/watch?v=x')).toBe(false);
    expect(isYouTubeUrl('https://youtu.be.evil.example/x')).toBe(false);
  });

  it('rejects other video hosts and non-URLs', () => {
    expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
    expect(isYouTubeUrl('not a url')).toBe(false);
    expect(isYouTubeUrl('')).toBe(false);
  });
});
