import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(61)).toBe('1:01');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36061)).toBe('10:01:01');
  });

  it('returns empty string for missing or negative input', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-1)).toBe('');
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(0)).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('includes the year for a valid unix timestamp', () => {
    // 2024-01-10T00:00:00Z
    expect(formatDate(1704844800)).toContain('2024');
  });
});

describe('formatRelative', () => {
  const now = () => Math.floor(Date.now() / 1000);

  it('returns empty string for missing input', () => {
    expect(formatRelative(0)).toBe('');
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });

  it('describes recent timestamps relative to now', () => {
    expect(formatRelative(now() - 10)).toBe('just now');
    expect(formatRelative(now() - 120)).toBe('2 min ago');
    expect(formatRelative(now() - 2 * 3600)).toBe('2 h ago');
    expect(formatRelative(now() - 3 * 86400)).toBe('3 d ago');
  });

  it('falls back to an absolute date beyond 30 days', () => {
    // ~60 days ago: no longer a relative phrase, so it must show a year.
    expect(formatRelative(now() - 60 * 86400)).toMatch(/\d{4}/);
  });
});
