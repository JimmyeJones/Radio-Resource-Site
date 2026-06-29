'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playMorse, KOCH_ORDER } from '@/lib/morse-audio';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Play, Square, Volume2, Check, X, RotateCcw } from 'lucide-react';

type Mode = 'play' | 'koch';

export function CwTrainer() {
  const [mode, setMode] = useState<Mode>('play');
  return (
    <Card className="mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-accent" aria-hidden /> CW audio trainer
        </CardTitle>
        <div role="tablist" aria-label="Trainer mode" className="flex rounded-lg border border-border p-0.5 text-sm">
          <TabButton active={mode === 'play'} onClick={() => setMode('play')}>Player</TabButton>
          <TabButton active={mode === 'koch'} onClick={() => setMode('koch')}>Koch practice</TabButton>
        </div>
      </div>
      {mode === 'play' ? <PlayerPanel /> : <KochPanel />}
    </Card>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-3 py-1 font-medium transition-colors ${active ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'}`}
    >
      {children}
    </button>
  );
}

function SpeedControls({
  wpm, setWpm, farnsworth, setFarnsworth, tone, setTone,
}: {
  wpm: number; setWpm: (n: number) => void;
  farnsworth: number; setFarnsworth: (n: number) => void;
  tone: number; setTone: (n: number) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Slider id="cw-wpm" label="Character speed" value={wpm} min={5} max={40} step={1} unit="WPM" onChange={setWpm} />
      <Slider id="cw-fw" label="Effective speed" value={farnsworth} min={5} max={wpm} step={1} unit="WPM" onChange={setFarnsworth} />
      <Slider id="cw-tone" label="Tone" value={tone} min={400} max={1000} step={25} unit="Hz" onChange={setTone} />
    </div>
  );
}

function Slider({
  id, label, value, min, max, step, unit, onChange,
}: {
  id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (n: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-accent">{value} {unit}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-accent"
      />
    </div>
  );
}

function usePlayback() {
  const abortRef = useRef<AbortController | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(
    async (text: string, opts: { wpm: number; farnsworthWpm: number; toneHz: number; onSymbolStart?: (c: string) => void }) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setPlaying(true);
      try {
        await playMorse(text, { ...opts, signal: ac.signal });
      } catch {
        /* noop */
      } finally {
        if (abortRef.current === ac) {
          abortRef.current = null;
          setPlaying(false);
        }
      }
    },
    [],
  );

  useEffect(() => () => abortRef.current?.abort(), []);
  return { playing, play, stop };
}

function PlayerPanel() {
  const [text, setText] = useState('CQ CQ DE W1AW K');
  const [wpm, setWpm] = useState(18);
  const [farnsworth, setFarnsworth] = useState(13);
  const [tone, setTone] = useState(600);
  const [pos, setPos] = useState(-1);
  const { playing, play, stop } = usePlayback();

  // Keep effective speed from exceeding character speed.
  useEffect(() => {
    if (farnsworth > wpm) setFarnsworth(wpm);
  }, [wpm, farnsworth]);

  const chars = Array.from(text.toUpperCase());

  async function start() {
    setPos(-1);
    let i = -1;
    await play(text, {
      wpm,
      farnsworthWpm: farnsworth,
      toneHz: tone,
      onSymbolStart: () => {
        i += 1;
        // Advance the highlight to the next non-space sounding character.
        let next = i;
        // Map the i-th *sounding* character back to its index in `chars`.
        let count = -1;
        for (let k = 0; k < chars.length; k++) {
          if (chars[k] !== ' ') count += 1;
          if (count === i) { next = k; break; }
        }
        setPos(next);
      },
    });
    setPos(-1);
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cw-play-text" className="mb-1 block text-sm font-medium">Text to send</label>
        <Input
          id="cw-play-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono"
          placeholder="Type anything…"
        />
      </div>

      <p className="min-h-[2rem] break-words font-mono text-2xl leading-relaxed tracking-wider" aria-live="off">
        {chars.length === 0 ? <span className="text-muted">—</span> : chars.map((c, i) => (
          <span
            key={i}
            className={`rounded px-0.5 ${i === pos ? 'bg-accent text-accent-fg' : c === ' ' ? '' : 'text-fg/80'}`}
          >
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </p>

      <SpeedControls wpm={wpm} setWpm={setWpm} farnsworth={farnsworth} setFarnsworth={setFarnsworth} tone={tone} setTone={setTone} />

      <div className="flex gap-2">
        {playing ? (
          <Button variant="secondary" onClick={stop}><Square className="h-4 w-4" aria-hidden /> Stop</Button>
        ) : (
          <Button onClick={start} disabled={chars.length === 0}><Play className="h-4 w-4" aria-hidden /> Play</Button>
        )}
      </div>
      <p className="text-xs text-muted">
        Farnsworth timing keeps each character at the full character speed while stretching the gaps — the standard way to learn without developing a counting habit.
      </p>
    </div>
  );
}

function randomGroup(pool: string[], len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += pool[Math.floor(Math.random() * pool.length)];
  return s;
}

function KochPanel() {
  const [level, setLevel] = useState(2); // number of Koch characters in play
  const [groupLen, setGroupLen] = useState(5);
  const [wpm, setWpm] = useState(20);
  const [farnsworth, setFarnsworth] = useState(13);
  const [tone, setTone] = useState(600);
  const [answer, setAnswer] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const { playing, play, stop } = usePlayback();
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = KOCH_ORDER.slice(0, level);

  useEffect(() => {
    if (farnsworth > wpm) setFarnsworth(wpm);
  }, [wpm, farnsworth]);

  async function sendNew() {
    const group = randomGroup(pool, groupLen);
    setSent(group);
    setAnswer('');
    setRevealed(false);
    inputRef.current?.focus();
    await play(group, { wpm, farnsworthWpm: farnsworth, toneHz: tone });
  }

  async function replay() {
    if (sent) await play(sent, { wpm, farnsworthWpm: farnsworth, toneHz: tone });
  }

  function check() {
    if (!sent || revealed) return;
    const guess = answer.toUpperCase().replace(/\s+/g, '');
    const ok = guess === sent;
    setRevealed(true);
    setStats((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const guessChars = Array.from(answer.toUpperCase().replace(/\s+/g, ''));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        The Koch method teaches at full target speed, adding one character at a time. Listen to the group, type what you hear, then check.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Slider id="koch-level" label="Characters in play" value={level} min={2} max={KOCH_ORDER.length} step={1} unit="" onChange={setLevel} />
        <Slider id="koch-len" label="Group length" value={groupLen} min={3} max={10} step={1} unit="" onChange={setGroupLen} />
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Characters currently in the pool">
        {pool.map((c) => (
          <span key={c} className="rounded border border-border bg-elevated px-2 py-0.5 font-mono text-sm font-semibold">{c}</span>
        ))}
      </div>

      <SpeedControls wpm={wpm} setWpm={setWpm} farnsworth={farnsworth} setFarnsworth={setFarnsworth} tone={tone} setTone={setTone} />

      <div className="flex flex-wrap gap-2">
        <Button onClick={sendNew} disabled={playing}><Play className="h-4 w-4" aria-hidden /> {sent ? 'Next group' : 'Start'}</Button>
        <Button variant="secondary" onClick={replay} disabled={!sent || playing}><RotateCcw className="h-4 w-4" aria-hidden /> Replay</Button>
        {playing ? <Button variant="ghost" onClick={stop}><Square className="h-4 w-4" aria-hidden /> Stop</Button> : null}
      </div>

      {sent ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="koch-answer" className="mb-1 block text-sm font-medium">What did you hear?</label>
            <Input
              ref={inputRef}
              id="koch-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
              className="font-mono text-lg tracking-widest"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={revealed}
            />
          </div>
          {!revealed ? (
            <Button variant="secondary" onClick={check} disabled={!answer.trim()}><Check className="h-4 w-4" aria-hidden /> Check</Button>
          ) : (
            <div className="rounded-lg border border-border bg-elevated p-3" aria-live="polite">
              <p className="mb-1 text-sm font-medium">Sent</p>
              <p className="font-mono text-2xl tracking-widest">
                {Array.from(sent).map((c, i) => {
                  const got = guessChars[i];
                  const ok = got === c;
                  return (
                    <span key={i} className={`inline-flex items-center ${ok ? 'text-success' : 'text-danger'}`}>
                      {c}{ok ? null : got ? <s className="ml-0.5 text-xs text-muted">{got}</s> : null}
                    </span>
                  );
                })}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                {guessChars.join('') === sent
                  ? <><Check className="h-4 w-4 text-success" aria-hidden /> Correct</>
                  : <><X className="h-4 w-4 text-danger" aria-hidden /> Keep at it</>}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {stats.total > 0 ? (
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted">Session: <span className="font-semibold text-fg">{stats.correct}/{stats.total}</span> groups · {accuracy}% accuracy</span>
          <button type="button" onClick={() => setStats({ correct: 0, total: 0 })} className="text-accent hover:underline">Reset</button>
        </div>
      ) : null}
    </div>
  );
}
