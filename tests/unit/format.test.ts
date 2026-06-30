import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats minutes:seconds under an hour', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats hours:minutes:seconds with zero-padding', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('returns empty string for missing or invalid input', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });
});

describe('formatRelative', () => {
  const now = Math.floor(Date.now() / 1000);

  it('describes recent times in coarse buckets', () => {
    expect(formatRelative(now - 30)).toBe('just now');
    expect(formatRelative(now - 120)).toBe('2 min ago');
    expect(formatRelative(now - 7200)).toBe('2 h ago');
    expect(formatRelative(now - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    expect(formatRelative(now - 60 * 86400)).toBe(formatDate(now - 60 * 86400));
  });

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('renders a non-empty label for a valid timestamp', () => {
    expect(formatDate(1704067200)).not.toBe('');
  });
});
