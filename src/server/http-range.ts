// Parse a single HTTP `Range` request header against a known resource size.
// Supports the byte-range forms used by media players:
//   bytes=START-END   explicit range (END clamped to the last byte)
//   bytes=START-       from START to the end of the resource
//   bytes=-SUFFIX      the final SUFFIX bytes of the resource
// Multi-range and unrecognized units are not supported and yield 'full'
// (RFC 7233 §3.1: an unsatisfiable-to-parse / unknown Range is ignored).

export type RangeResult =
  | { type: 'full' }
  | { type: 'range'; start: number; end: number }
  | { type: 'unsatisfiable' };

export function parseRangeHeader(header: string | null | undefined, size: number): RangeResult {
  if (!header) return { type: 'full' };

  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return { type: 'full' };

  const hasStart = m[1] !== '';
  const hasEnd = m[2] !== '';
  if (!hasStart && !hasEnd) return { type: 'unsatisfiable' }; // "bytes=-"

  let start: number;
  let end: number;

  if (!hasStart) {
    // Suffix range: the last N bytes.
    const suffix = Number(m[2]);
    if (suffix === 0 || size === 0) return { type: 'unsatisfiable' };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(m[1]);
    if (start >= size) return { type: 'unsatisfiable' };
    // Clamp an out-of-range or omitted end to the last byte.
    end = hasEnd ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (end < start) return { type: 'unsatisfiable' };
  }

  return { type: 'range', start, end };
}
