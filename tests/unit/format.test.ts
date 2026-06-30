import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('returns an empty string for missing or negative input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });
});

describe('formatDate / formatRelative guards', () => {
  it('returns an empty string for missing timestamps', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });
});

describe('formatRelative buckets', () => {
  const now = () => Math.floor(Date.now() / 1000);
  it('reports recent timestamps as "just now"', () => {
    expect(formatRelative(now() - 5)).toBe('just now');
  });
  it('reports minutes, hours, and days ago', () => {
    expect(formatRelative(now() - 90)).toBe('1 min ago');
    expect(formatRelative(now() - 2 * 3600)).toBe('2 h ago');
    expect(formatRelative(now() - 3 * 86400)).toBe('3 d ago');
  });
});
