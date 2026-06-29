import { describe, it, expect } from 'vitest';
import { classify } from '@/lib/topics';

describe('topic classifier', () => {
  it('tags satellite/feed content (dereksgc-style)', () => {
    const t = classify('Building an L-band feed for the QO-100 satellite dish', '', 'dereksgc');
    expect(t).toContain('satellite');
    expect(t).toContain('feed');
  });

  it('tags weather satellite content', () => {
    const t = classify('Receiving NOAA APT weather images with an RTL-SDR', '');
    expect(t).toContain('weather-sat');
    expect(t).toContain('sdr');
  });

  it('tags PCB content', () => {
    const t = classify('KiCad PCB design: controlled impedance and gerber export', '');
    expect(t).toContain('pcb');
  });

  it('tags ham radio content', () => {
    const t = classify('POTA activation on 20m SSB with my new dipole', '');
    expect(t).toContain('ham');
    expect(t).toContain('antenna');
  });

  it('falls back to uncategorized for off-topic', () => {
    expect(classify('My trip to the bakery', 'croissants and coffee')).toEqual(['uncategorized']);
  });
});
