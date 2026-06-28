import { describe, it, expect } from 'vitest';
import { spellPhonetic, NATO_PHONETIC } from '@/lib/tools/phonetics';

describe('phonetic alphabet', () => {
  it('has 26 letters + 10 digits', () => {
    expect(Object.keys(NATO_PHONETIC)).toHaveLength(36);
  });
  it('spells callsigns', () => {
    expect(spellPhonetic('W1AW')).toEqual(['Whiskey', 'One', 'Alfa', 'Whiskey']);
  });
  it('handles stroke', () => {
    expect(spellPhonetic('K6UDA/P')).toContain('Stroke');
  });
});
