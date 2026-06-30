import technician from '@/data/exam/technician.json';

export interface ExamQuestion {
  id: string;
  question: string;
  answers: string[];
  correct: number;
}

export interface ExamPool {
  pool: string;
  label: string;
  note?: string;
  questions: ExamQuestion[];
}

// Bundled pools. Drop additional JSON files in src/data/exam/ and import them here.
export const POOLS: ExamPool[] = [technician as ExamPool];

export function getPool(id: string): ExamPool | undefined {
  return POOLS.find((p) => p.pool === id);
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
