import { describe, it, expect } from 'vitest';
import { resolveByteRange } from '@/lib/http-range';

const SIZE = 1000; // bytes 0..999

describe('resolveByteRange', () => {
  it('parses an explicit start-end range', () => {
    expect(resolveByteRange('bytes=200-499', SIZE)).toEqual({ start: 200, end: 499 });
  });

  it('treats an open-ended range as running to the last byte', () => {
    expect(resolveByteRange('bytes=200-', SIZE)).toEqual({ start: 200, end: 999 });
    expect(resolveByteRange('bytes=0-', SIZE)).toEqual({ start: 0, end: 999 });
  });

  it('resolves a suffix range to the final N bytes', () => {
    expect(resolveByteRange('bytes=-500', SIZE)).toEqual({ start: 500, end: 999 });
    expect(resolveByteRange('bytes=-1', SIZE)).toEqual({ start: 999, end: 999 });
  });

  it('clamps a suffix larger than the resource to the whole resource', () => {
    expect(resolveByteRange('bytes=-5000', SIZE)).toEqual({ start: 0, end: 999 });
  });

  it('tolerates surrounding whitespace', () => {
    expect(resolveByteRange('  bytes=0-9 ', SIZE)).toEqual({ start: 0, end: 9 });
  });

  it('rejects unsatisfiable ranges (start at or past end of resource)', () => {
    expect(resolveByteRange('bytes=1000-1001', SIZE)).toBeNull();
    expect(resolveByteRange('bytes=1000-', SIZE)).toBeNull();
  });

  it('rejects an end beyond the resource size', () => {
    expect(resolveByteRange('bytes=0-1000', SIZE)).toBeNull();
  });

  it('rejects reversed ranges', () => {
    expect(resolveByteRange('bytes=500-200', SIZE)).toBeNull();
  });

  it('rejects malformed or empty headers', () => {
    expect(resolveByteRange('bytes=-', SIZE)).toBeNull();
    expect(resolveByteRange('bytes=-0', SIZE)).toBeNull();
    expect(resolveByteRange('bytes=abc-def', SIZE)).toBeNull();
    expect(resolveByteRange('items=0-10', SIZE)).toBeNull();
    expect(resolveByteRange('', SIZE)).toBeNull();
  });
});
