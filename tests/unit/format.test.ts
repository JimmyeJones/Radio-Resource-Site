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
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('truncates fractional seconds', () => {
    expect(formatDuration(65.9)).toBe('1:05');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('renders a non-empty human date for a real timestamp', () => {
    // 2024-01-10T00:00:00Z
    expect(formatDate(1704844800).length).toBeGreaterThan(0);
  });
});

describe('formatRelative', () => {
  const now = () => Math.floor(Date.now() / 1000);

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(0)).toBe('');
  });

  it('reports very recent timestamps as "just now"', () => {
    expect(formatRelative(now() - 5)).toBe('just now');
  });

  it('reports minutes, hours, and days for older timestamps', () => {
    expect(formatRelative(now() - 5 * 60)).toBe('5 min ago');
    expect(formatRelative(now() - 3 * 3600)).toBe('3 h ago');
    expect(formatRelative(now() - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    expect(formatRelative(now() - 60 * 86400)).not.toMatch(/ago|just now/);
  });
});
