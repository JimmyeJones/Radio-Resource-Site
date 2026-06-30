import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('returns empty string for empty/invalid input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });

  it('formats sub-hour durations as m:ss with zero-padded seconds', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hour-plus durations as h:mm:ss with zero-padding', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('floors fractional seconds', () => {
    expect(formatDuration(90.9)).toBe('1:30');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('formats a unix timestamp into a non-empty, year-bearing label', () => {
    // 2024-01-15T12:00:00Z
    const out = formatDate(1705320000);
    expect(out).not.toBe('');
    expect(out).toContain('2024');
  });
});

describe('formatRelative', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(0)).toBe('');
  });

  it('describes recent times relative to now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelative(now - 10)).toBe('just now');
    expect(formatRelative(now - 120)).toBe('2 min ago');
    expect(formatRelative(now - 7200)).toBe('2 h ago');
    expect(formatRelative(now - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const now = Math.floor(Date.now() / 1000);
    const out = formatRelative(now - 40 * 86400);
    expect(out).toContain('2024');
    expect(out).not.toContain('ago');
  });
});
