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
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('truncates fractional seconds', () => {
    expect(formatDuration(90.9)).toBe('1:30');
  });
});

describe('formatDate', () => {
  it('returns empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });

  it('renders a non-empty date for a valid unix timestamp', () => {
    // 2024-06-15T12:00:00Z
    const out = formatDate(1718452800);
    expect(out).not.toBe('');
    expect(out).toContain('2024');
  });
});

describe('formatRelative', () => {
  const now = Math.floor(Date.now() / 1000);

  it('returns empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(0)).toBe('');
  });

  it('labels very recent timestamps as "just now"', () => {
    expect(formatRelative(now - 5)).toBe('just now');
  });

  it('labels minutes, hours, and days', () => {
    expect(formatRelative(now - 120)).toBe('2 min ago');
    expect(formatRelative(now - 7200)).toBe('2 h ago');
    expect(formatRelative(now - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    // 2024-06-15T12:00:00Z — well over 30 days ago, so formats as a date.
    expect(formatRelative(1718452800)).toContain('2024');
  });
});
