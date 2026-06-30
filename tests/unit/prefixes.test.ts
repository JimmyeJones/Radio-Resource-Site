import { describe, it, expect } from 'vitest';
import { lookupCallsign, parsePrefix } from '@/lib/tools/prefixes';

describe('callsign prefix lookup', () => {
  it('identifies common US calls', () => {
    expect(lookupCallsign('W1AW').entry?.country).toBe('United States');
    expect(lookupCallsign('K6UDA').entry?.country).toBe('United States');
    expect(lookupCallsign('AA1A').entry?.country).toBe('United States');
  });

  it('separates Hawaii and Alaska from the mainland', () => {
    expect(lookupCallsign('KH6XYZ').entry?.country).toBe('Hawaii');
    expect(lookupCallsign('KL7ABC').entry?.country).toBe('Alaska');
  });

  it('identifies common UK and DE calls', () => {
    expect(lookupCallsign('G0ABC').entry?.country).toBe('United Kingdom');
    expect(lookupCallsign('M0XYZ').entry?.country).toBe('United Kingdom');
    expect(lookupCallsign('DL1ABC').entry?.country).toBe('Germany');
  });

  it('identifies Japan', () => {
    expect(lookupCallsign('JA1XYZ').entry?.country).toBe('Japan');
    expect(lookupCallsign('7K2ABC').entry?.country).toBe('Japan');
  });

  it('handles 2-prefix UK', () => {
    expect(lookupCallsign('2E0ABC').entry?.country).toBe('United Kingdom');
  });

  it('returns null for nonsense', () => {
    expect(lookupCallsign('@@@').entry).toBeNull();
  });

  it('parsePrefix extracts the leading digit group', () => {
    expect(parsePrefix('W1AW')).toBe('W1');
    expect(parsePrefix('JA1XYZ')).toBe('JA1');
    expect(parsePrefix('2E0ABC')).toBe('2E0');
  });

  it('parsePrefix strips trailing portable suffixes', () => {
    expect(parsePrefix('K6UDA/P')).toBe('K6');
    expect(parsePrefix('W1AW/M')).toBe('W1');
    expect(parsePrefix('VE3ABC/MM')).toBe('VE3');
    expect(parsePrefix('DL1ABC/QRP')).toBe('DL1');
  });
});
