import { describe, it, expect } from 'vitest';
import { parseRangeHeader } from '@/server/http-range';

describe('parseRangeHeader', () => {
  const size = 1000;

  it('serves full content when no Range header is present', () => {
    expect(parseRangeHeader(null, size)).toEqual({ type: 'full' });
    expect(parseRangeHeader(undefined, size)).toEqual({ type: 'full' });
  });

  it('parses an explicit start-end range', () => {
    expect(parseRangeHeader('bytes=100-199', size)).toEqual({ type: 'range', start: 100, end: 199 });
  });

  it('defaults a missing end to the last byte', () => {
    expect(parseRangeHeader('bytes=500-', size)).toEqual({ type: 'range', start: 500, end: 999 });
  });

  it('handles a suffix range as the final N bytes', () => {
    expect(parseRangeHeader('bytes=-500', size)).toEqual({ type: 'range', start: 500, end: 999 });
  });

  it('clamps a suffix larger than the resource to the whole resource', () => {
    expect(parseRangeHeader('bytes=-5000', size)).toEqual({ type: 'range', start: 0, end: 999 });
  });

  it('clamps an end past the last byte instead of rejecting', () => {
    expect(parseRangeHeader('bytes=0-99999', size)).toEqual({ type: 'range', start: 0, end: 999 });
  });

  it('rejects a start at or beyond the resource size', () => {
    expect(parseRangeHeader('bytes=1000-1100', size)).toEqual({ type: 'unsatisfiable' });
    expect(parseRangeHeader('bytes=2000-', size)).toEqual({ type: 'unsatisfiable' });
  });

  it('rejects a zero-length suffix and an empty range', () => {
    expect(parseRangeHeader('bytes=-0', size)).toEqual({ type: 'unsatisfiable' });
    expect(parseRangeHeader('bytes=-', size)).toEqual({ type: 'unsatisfiable' });
  });

  it('rejects ranges against a zero-byte resource', () => {
    expect(parseRangeHeader('bytes=-100', 0)).toEqual({ type: 'unsatisfiable' });
    expect(parseRangeHeader('bytes=0-', 0)).toEqual({ type: 'unsatisfiable' });
  });

  it('ignores unrecognized or multi-range headers and serves full content', () => {
    expect(parseRangeHeader('items=0-10', size)).toEqual({ type: 'full' });
    expect(parseRangeHeader('bytes=0-10,20-30', size)).toEqual({ type: 'full' });
    expect(parseRangeHeader('garbage', size)).toEqual({ type: 'full' });
  });
});
