import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('returns empty string for missing or invalid input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });

  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(605)).toBe('10:05');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('renders a non-empty date for a valid unix timestamp', () => {
    // 2024-01-15T00:00:00Z. Exact wording is locale-dependent, so only
    // assert it produced something.
    expect(formatDate(1705276800).length).toBeGreaterThan(0);
  });
});

describe('formatRelative', () => {
  const now = Math.floor(Date.now() / 1000);

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(0)).toBe('');
  });

  it('reports very recent times as "just now"', () => {
    expect(formatRelative(now - 10)).toBe('just now');
  });

  it('reports minutes, hours, and days', () => {
    expect(formatRelative(now - 120)).toBe('2 min ago');
    expect(formatRelative(now - 2 * 3600)).toBe('2 h ago');
    expect(formatRelative(now - 3 * 86400)).toBe('3 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    const old = now - 60 * 86400;
    expect(formatRelative(old)).toBe(formatDate(old));
  });
});
