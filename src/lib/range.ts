// Parse and validate an HTTP Range request header against a known resource size.
// Kept as a pure function so the streaming route's range handling is testable
// without a database or filesystem.

export type RangeResult =
  | { kind: 'ok'; start: number; end: number }
  | { kind: 'malformed' }
  | { kind: 'unsatisfiable' };

export function resolveByteRange(header: string, size: number): RangeResult {
  const m = /bytes=(\d*)-(\d*)/.exec(header);
  if (!m) return { kind: 'malformed' };
  const start = m[1] ? Number(m[1]) : 0;
  const end = m[2] ? Number(m[2]) : size - 1;
  // start > end is an unsatisfiable range; without this guard it reaches
  // createReadStream({ start, end }) which throws ERR_OUT_OF_RANGE.
  if (start > end || start >= size || end >= size) return { kind: 'unsatisfiable' };
  return { kind: 'ok', start, end };
}
