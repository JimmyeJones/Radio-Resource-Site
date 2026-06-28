'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/cn';

type Theme = 'system' | 'light' | 'dark';

function apply(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(stored);
    apply(stored);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const t = (localStorage.getItem('theme') as Theme | null) ?? 'system';
      if (t === 'system') apply('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function setAndApply(t: Theme) {
    setTheme(t);
    localStorage.setItem('theme', t);
    apply(t);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center rounded-md border border-border bg-surface p-0.5"
    >
      {(
        [
          { v: 'light', Icon: Sun, label: 'Light' },
          { v: 'system', Icon: Monitor, label: 'System' },
          { v: 'dark', Icon: Moon, label: 'Dark' },
        ] as { v: Theme; Icon: typeof Sun; label: string }[]
      ).map(({ v, Icon, label }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={theme === v}
          aria-label={`${label} theme`}
          onClick={() => setAndApply(v)}
          className={cn(
            'h-8 w-8 rounded inline-flex items-center justify-center text-fg/70 hover:text-fg',
            theme === v && 'bg-elevated text-fg',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
