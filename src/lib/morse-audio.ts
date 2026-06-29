import { MORSE } from '@/lib/tools/cw';

export interface MorsePlayOptions {
  wpm?: number; // character speed
  farnsworthWpm?: number; // overall (effective) speed; <= wpm spreads out spacing
  toneHz?: number;
  onSymbolStart?: (char: string) => void;
  signal?: AbortSignal;
}

/**
 * Play text as Morse with a Web Audio sidetone. Uses PARIS timing:
 * dit = 1.2 / wpm seconds. Farnsworth stretches inter-character/word gaps
 * while keeping each character at full `wpm` speed.
 */
export async function playMorse(text: string, opts: MorsePlayOptions = {}): Promise<void> {
  const wpm = opts.wpm ?? 18;
  const fw = Math.min(opts.farnsworthWpm ?? wpm, wpm);
  const toneHz = opts.toneHz ?? 600;

  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = toneHz;
  osc.connect(gain);
  osc.start();

  const dit = 1.2 / wpm; // seconds
  // Farnsworth: total time for one "PARIS" at fw wpm, distribute extra into gaps.
  const fdit = 1.2 / fw;
  const charGap = 3 * fdit; // between characters (stretched)
  const wordGap = 7 * fdit; // between words (stretched)

  let t = ctx.currentTime + 0.05;
  const ramp = 0.004;

  function tone(durSec: number) {
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + ramp);
    gain.gain.setValueAtTime(0.25, t + durSec - ramp);
    gain.gain.linearRampToValueAtTime(0, t + durSec);
    t += durSec;
  }
  function silence(durSec: number) {
    t += durSec;
  }

  const chars = Array.from(text.toUpperCase());
  for (let i = 0; i < chars.length; i++) {
    if (opts.signal?.aborted) break;
    const ch = chars[i];
    if (ch === ' ') {
      silence(wordGap - charGap);
      continue;
    }
    const code = MORSE[ch];
    if (!code) continue;
    if (opts.onSymbolStart) {
      const when = (t - ctx.currentTime) * 1000;
      setTimeout(() => opts.onSymbolStart?.(ch), Math.max(0, when));
    }
    for (let j = 0; j < code.length; j++) {
      tone(code[j] === '-' ? 3 * dit : dit);
      if (j < code.length - 1) silence(dit); // intra-char gap
    }
    if (i < chars.length - 1 && chars[i + 1] !== ' ') silence(charGap);
  }

  const endAt = t + 0.1;
  return new Promise<void>((resolve) => {
    const stop = () => {
      try { osc.stop(); } catch { /* noop */ }
      try { void ctx.close(); } catch { /* noop */ }
      resolve();
    };
    if (opts.signal) opts.signal.addEventListener('abort', stop, { once: true });
    const ms = Math.max(0, (endAt - ctx.currentTime) * 1000);
    setTimeout(stop, ms);
  });
}

// Koch method character order — the standard learning sequence.
export const KOCH_ORDER = 'KMURESNAPTLWI.JZ=FOY,VG5/Q9ZH38B?427C1D6X'.split('');
