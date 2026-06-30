import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatRelative } from '@/lib/format';

describe('formatDuration', () => {
  it('formats sub-minute durations as m:ss', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats minute durations as m:ss', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats hour durations as h:mm:ss with zero-padding', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatDuration(90.7)).toBe('1:30');
  });

  it('returns an empty string for missing or invalid input', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(-5)).toBe('');
  });
});

describe('formatDate', () => {
  it('renders a year/month/day string for a unix timestamp', () => {
    // 2024-01-10T00:00:00Z
    const out = formatDate(1704844800);
    expect(out).toContain('2024');
    expect(out).not.toBe('');
  });

  it('returns an empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(0)).toBe('');
  });
});

describe('formatRelative', () => {
  const now = () => Math.floor(Date.now() / 1000);

  it('reports recent timestamps as "just now"', () => {
    expect(formatRelative(now() - 10)).toBe('just now');
  });

  it('reports minutes, hours, and days ago', () => {
    expect(formatRelative(now() - 120)).toBe('2 min ago');
    expect(formatRelative(now() - 7200)).toBe('2 h ago');
    expect(formatRelative(now() - 2 * 86400)).toBe('2 d ago');
  });

  it('falls back to an absolute date beyond ~30 days', () => {
    const out = formatRelative(now() - 40 * 86400);
    expect(out).not.toMatch(/ago|just now/);
    expect(out).not.toBe('');
  });

  it('returns an empty string for missing input', () => {
    expect(formatRelative(null)).toBe('');
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(0)).toBe('');
  });
});
