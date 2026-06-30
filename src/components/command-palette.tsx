'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_TOOLS } from '@/lib/tool-registry';
import { fuzzyRank } from '@/lib/fuzzy';
import {
  Search, CornerDownLeft, Home, Library, FolderKanban, Cpu, RadioTower, BookText,
  NotebookPen, BookmarkPlus, Wrench, Settings, MapPin, Sun, Moon, Video, Newspaper,
  FileText, type LucideIcon,
} from 'lucide-react';

interface Cmd {
  id: string;
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
  run: () => void;
  group: string;
}

const NAV: { title: string; href: string; Icon: LucideIcon }[] = [
  { title: 'Dashboard', href: '/', Icon: Home },
  { title: 'Live World Map', href: '/map', Icon: MapPin },
  { title: 'Library', href: '/library', Icon: Library },
  { title: 'Projects', href: '/projects', Icon: FolderKanban },
  { title: 'Parts', href: '/parts', Icon: Cpu },
  { title: 'Frequencies', href: '/frequencies', Icon: RadioTower },
  { title: 'Logbook', href: '/logbook', Icon: BookText },
  { title: 'Notes', href: '/notes', Icon: NotebookPen },
  { title: 'Feeds', href: '/feeds', Icon: BookmarkPlus },
  { title: 'Hub', href: '/hub', Icon: BookmarkPlus },
  { title: 'Tools', href: '/tools', Icon: Wrench },
  { title: 'Settings', href: '/settings', Icon: Settings },
];

const DOC_ICON: Record<string, LucideIcon> = {
  video: Video, article: Newspaper, hub: BookmarkPlus, datasheet: FileText,
  project: FolderKanban, frequency: RadioTower, part: Cpu, qso: BookText, note: NotebookPen,
};

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<Cmd[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setRemote([]);
    lastFocus.current?.focus?.();
  }, []);

  // Global open shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isTyping(e))) {
        e.preventDefault();
        lastFocus.current = document.activeElement as HTMLElement;
        setOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Expose a global opener for the nav button.
  useEffect(() => {
    (window as unknown as { __openPalette?: () => void }).__openPalette = () => {
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const actions: Cmd[] = useMemo(
    () => [
      { id: 'theme-dark', title: 'Switch to dark theme', Icon: Moon, group: 'Actions', run: () => applyTheme('dark') },
      { id: 'theme-light', title: 'Switch to light theme', Icon: Sun, group: 'Actions', run: () => applyTheme('light') },
    ],
    [],
  );

  const staticCmds: Cmd[] = useMemo(() => {
    const nav: Cmd[] = NAV.map((n) => ({ id: `nav:${n.href}`, title: n.title, Icon: n.Icon, group: 'Go to', run: () => router.push(n.href) }));
    const tools: Cmd[] = ALL_TOOLS.map((t) => ({ id: `tool:${t.href}`, title: t.title, subtitle: t.description, Icon: t.Icon, group: 'Tools', run: () => router.push(t.href) }));
    return [...nav, ...tools, ...actions];
  }, [router, actions]);

  // Debounced remote (library) search.
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setRemote([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/command-search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
        const data = (await res.json()) as { results: { docType: string; docId: string; url: string; title: string; snippet: string }[] };
        setRemote(
          data.results.map((r) => ({
            id: `lib:${r.docType}:${r.docId}`,
            title: r.title,
            subtitle: r.snippet?.replace(/\s+/g, ' ').slice(0, 80),
            Icon: DOC_ICON[r.docType] ?? FileText,
            group: 'Library',
            run: () => (r.url.startsWith('http') ? window.open(r.url, '_blank') : router.push(r.url)),
          })),
        );
      } catch {
        setRemote([]);
      }
    }, 160);
    return () => clearTimeout(id);
  }, [query, open, router]);

  const results: Cmd[] = useMemo(() => {
    if (!query.trim()) {
      return staticCmds.filter((c) => c.group === 'Go to' || c.group === 'Tools').slice(0, 8);
    }
    const ranked = fuzzyRank(query, staticCmds, (c) => `${c.title} ${c.subtitle ?? ''}`, 10).map((s) => s.item);
    return [...ranked, ...remote];
  }, [query, staticCmds, remote]);

  useEffect(() => setActive(0), [query, remote.length]);

  if (!open) return null;

  function activate(i: number) {
    const cmd = results[i];
    if (!cmd) return;
    close();
    cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); activate(active); }
  }

  let lastGroup = '';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="presentation">
      <button type="button" aria-label="Close command palette" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="rise-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, pages, library… "
            aria-label="Command palette search"
            aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-xs text-muted sm:block">esc</kbd>
        </div>

        <ul className="max-h-[55vh] overflow-y-auto p-2" role="listbox" aria-label="Results">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>
          ) : (
            results.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              const Icon = cmd.Icon;
              return (
                <li key={cmd.id}>
                  {showGroup ? (
                    <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">{cmd.group}</div>
                  ) : null}
                  <button
                    id={`cmd-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => activate(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === active ? 'bg-accent text-accent-fg' : 'hover:bg-elevated'}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${i === active ? '' : 'text-muted'}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{cmd.title}</span>
                      {cmd.subtitle ? <span className={`block truncate text-xs ${i === active ? 'text-accent-fg/80' : 'text-muted'}`}>{cmd.subtitle}</span> : null}
                    </span>
                    {i === active ? <CornerDownLeft className="h-4 w-4 shrink-0" aria-hidden /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
          <span><kbd className="rounded border border-border px-1">↑</kbd> <kbd className="rounded border border-border px-1">↓</kbd> navigate · <kbd className="rounded border border-border px-1">↵</kbd> open</span>
          <span><kbd className="rounded border border-border px-1">⌘K</kbd> / <kbd className="rounded border border-border px-1">/</kbd></span>
        </div>
      </div>
    </div>
  );
}

function isTyping(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}
