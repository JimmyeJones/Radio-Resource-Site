import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hour-plus durations as h:mm:ss with padding', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('floors fractional seconds', () => {
    expect(formatDuration(59.9)).toBe('0:59');
  });

  it('returns empty string for missing or negative input', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('renders a year for a known epoch', () => {
    // 1700000000 = 2023-11-14 (UTC). Locale formatting varies, but the year
    // should always be present.
    expect(formatDate(1700000000)).toContain('2023');
  });
});

describe('formatRelative', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function at(now: string, unix: number) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    return formatRelative(unix);
  }

  const NOW = '2024-01-10T00:00:00Z';
  const nowUnix = Date.parse(NOW) / 1000;

  it('reports "just now" within the last minute', () => {
    expect(at(NOW, nowUnix - 30)).toBe('just now');
  });

  it('reports minutes, hours, and days', () => {
    expect(at(NOW, nowUnix - 120)).toBe('2 min ago');
    expect(at(NOW, nowUnix - 7200)).toBe('2 h ago');
    expect(at(NOW, nowUnix - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    expect(at(NOW, nowUnix - 40 * 86400)).toContain('2023');
  });

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });
});
