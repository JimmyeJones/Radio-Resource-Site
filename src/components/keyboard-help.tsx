'use client';
import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['/'], label: 'Open command palette' },
  { keys: ['?'], label: 'Show this help' },
  { keys: ['↑', '↓'], label: 'Move through results' },
  { keys: ['↵'], label: 'Open the highlighted result' },
  { keys: ['Esc'], label: 'Close palette / dialogs' },
];

function isTyping(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?' && !isTyping(e)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="Close keyboard help" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="rise-in relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Keyboard className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
        </div>
        <ul className="divide-y divide-border">
          {SHORTCUTS.map((s) => (
            <li key={s.label + s.keys.join()} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-fg/85">{s.label}</span>
              <span className="flex shrink-0 items-center gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="min-w-[1.75rem] rounded border border-border bg-elevated px-1.5 py-0.5 text-center text-xs font-medium">{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-4 py-2 text-center text-xs text-muted">
          Press <kbd className="rounded border border-border px-1">?</kbd> anytime · <kbd className="rounded border border-border px-1">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
