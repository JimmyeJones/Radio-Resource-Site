import { describe, it, expect } from 'vitest';
import { Q_CODES } from '@/lib/tools/q-codes';

describe('Q-code reference table', () => {
  it('lists the common operating Q-codes', () => {
    const codes = Q_CODES.map((q) => q.code);
    for (const required of ['QRZ', 'QSL', 'QTH', 'QRM', 'QRP', 'QSY', 'QSO']) {
      expect(codes).toContain(required);
    }
  });

  it('every entry is a well-formed Q-code with text', () => {
    for (const q of Q_CODES) {
      expect(q.code).toMatch(/^Q[A-Z]{2}$/);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.statement.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate codes', () => {
    const codes = Q_CODES.map((q) => q.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
