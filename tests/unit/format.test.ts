import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('returns empty string for missing or negative input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });

  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(605)).toBe('10:05');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('renders the calendar year of a unix timestamp', () => {
    // 2024-01-11T00:00:00Z — year is stable across time zones.
    expect(formatDate(1704931200)).toContain('2024');
  });
});

describe('formatRelative', () => {
  const now = () => Math.floor(Date.now() / 1000);

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });

  it('buckets recent timestamps by elapsed time', () => {
    expect(formatRelative(now() - 30)).toBe('just now');
    expect(formatRelative(now() - 120)).toBe('2 min ago');
    expect(formatRelative(now() - 2 * 3600)).toBe('2 h ago');
    expect(formatRelative(now() - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    expect(formatRelative(1704931200)).toContain('2024');
  });
});
