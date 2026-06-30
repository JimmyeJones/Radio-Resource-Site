export interface ByteRange {
  start: number; // inclusive
  end: number; // inclusive
}

/**
 * Resolve a single HTTP `Range` header value against a known resource size.
 *
 * Returns the inclusive `[start, end]` byte range to serve, or `null` when the
 * header is malformed or unsatisfiable (the caller should respond `416`).
 * Only the first range is honored; multipart ranges are not supported.
 *
 * Handles the three RFC 7233 forms:
 *   - `bytes=200-999` — explicit start and end
 *   - `bytes=200-`    — open-ended (start to end of resource)
 *   - `bytes=-500`    — suffix (the final N bytes of the resource)
 */
export function resolveByteRange(range: string, size: number): ByteRange | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m) return null;

  const hasStart = m[1] !== '';
  const hasEnd = m[2] !== '';

  let start: number;
  let end: number;
  if (!hasStart) {
    // Suffix range: the final N bytes. "bytes=-" (no N) is invalid.
    if (!hasEnd) return null;
    const n = Number(m[2]);
    if (n === 0) return null;
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = hasEnd ? Number(m[2]) : size - 1;
  }

  if (start > end) return null;
  if (start >= size || end >= size) return null;
  return { start, end };
}
