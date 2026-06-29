// Lightweight fuzzy subsequence scorer — no dependency.
// Returns null when `query` isn't a subsequence of `text`; otherwise a score
// where higher is better (consecutive matches, word-starts, and earlier
// positions are rewarded).
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const t = text.toLowerCase();
  let score = 0;
  let ti = 0;
  let prevMatch = -2;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return null;
    score += 1;
    if (found === prevMatch + 1) score += 5; // consecutive
    if (found === 0 || /[\s\-/_.]/.test(t[found - 1])) score += 3; // word start
    score -= Math.min(found - ti, 4) * 0.3; // gap penalty
    prevMatch = found;
    ti = found + 1;
  }
  // Reward a shorter target (more specific match).
  score += Math.max(0, 12 - t.length * 0.05);
  return score;
}

export interface Scored<T> {
  item: T;
  score: number;
}

export function fuzzyRank<T>(query: string, items: T[], key: (item: T) => string, limit = 8): Scored<T>[] {
  const out: Scored<T>[] = [];
  for (const item of items) {
    const s = fuzzyScore(query, key(item));
    if (s !== null) out.push({ item, score: s });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
