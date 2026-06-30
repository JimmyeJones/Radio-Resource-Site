import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('returns empty string for missing or negative input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(-10)).toBe('');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('renders a non-empty date for a real unix timestamp', () => {
    // 2024-01-10T00:00:00Z
    expect(formatDate(1704844800)).not.toBe('');
  });
});

describe('formatRelative', () => {
  const now = () => Math.floor(Date.now() / 1000);

  it('reports recent times in coarse buckets', () => {
    expect(formatRelative(now() - 10)).toBe('just now');
    expect(formatRelative(now() - 120)).toBe('2 min ago');
    expect(formatRelative(now() - 2 * 3600)).toBe('2 h ago');
    expect(formatRelative(now() - 3 * 86400)).toBe('3 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    expect(formatRelative(now() - 60 * 86400)).not.toMatch(/ago|just now/);
  });

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });
});
