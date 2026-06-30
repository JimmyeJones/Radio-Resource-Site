import { describe, it, expect } from 'vitest';
import { resolveByteRange } from '@/lib/range';

const SIZE = 1000;

describe('resolveByteRange', () => {
  it('resolves an explicit start-end range', () => {
    expect(resolveByteRange('bytes=0-499', SIZE)).toEqual({ kind: 'ok', start: 0, end: 499 });
    expect(resolveByteRange('bytes=200-799', SIZE)).toEqual({ kind: 'ok', start: 200, end: 799 });
  });

  it('defaults a missing start to 0 and a missing end to size-1', () => {
    expect(resolveByteRange('bytes=500-', SIZE)).toEqual({ kind: 'ok', start: 500, end: 999 });
    expect(resolveByteRange('bytes=0-', SIZE)).toEqual({ kind: 'ok', start: 0, end: 999 });
  });

  it('accepts a single-byte range', () => {
    expect(resolveByteRange('bytes=0-0', SIZE)).toEqual({ kind: 'ok', start: 0, end: 0 });
  });

  it('reports a non-bytes header as malformed', () => {
    expect(resolveByteRange('items=0-10', SIZE).kind).toBe('malformed');
    expect(resolveByteRange('garbage', SIZE).kind).toBe('malformed');
  });

  it('reports out-of-bounds ranges as unsatisfiable', () => {
    expect(resolveByteRange('bytes=1000-1001', SIZE).kind).toBe('unsatisfiable');
    expect(resolveByteRange('bytes=0-1000', SIZE).kind).toBe('unsatisfiable');
  });

  it('reports an inverted range as unsatisfiable instead of crashing the stream', () => {
    // Regression: bytes=100-50 previously passed validation and reached
    // createReadStream({ start: 100, end: 50 }), which throws ERR_OUT_OF_RANGE.
    expect(resolveByteRange('bytes=100-50', SIZE).kind).toBe('unsatisfiable');
  });
});
