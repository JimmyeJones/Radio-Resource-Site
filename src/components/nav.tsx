'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Library, BookmarkPlus, Wrench, Settings, Home, FolderKanban, RadioTower, Cpu, BookText, NotebookPen, Globe, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './theme-toggle';

const items = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/map', label: 'Map', Icon: Globe },
  { href: '/library', label: 'Library', Icon: Library },
  { href: '/projects', label: 'Projects', Icon: FolderKanban },
  { href: '/parts', label: 'Parts', Icon: Cpu },
  { href: '/frequencies', label: 'Frequencies', Icon: RadioTower },
  { href: '/logbook', label: 'Logbook', Icon: BookText },
  { href: '/notes', label: 'Notes', Icon: NotebookPen },
  { href: '/hub', label: 'Hub', Icon: BookmarkPlus },
  { href: '/tools', label: 'Tools', Icon: Wrench },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Radio Resource Site, home"
        >
          <Radio className="h-5 w-5 text-accent" aria-hidden />
          <span className="hidden sm:inline">Radio Resource</span>
        </Link>
        <nav aria-label="Primary" className="min-w-0 flex-1">
          <ul className="flex items-center gap-1 overflow-x-auto text-sm">
            {items.slice(1).map(({ href, label, Icon }) => {
              const active = path === href || (href !== '/' && path.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    title={label}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-fg/80 hover:bg-elevated hover:text-fg lg:px-3',
                      active && 'bg-elevated text-fg font-medium',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden lg:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          onClick={() => (window as unknown as { __openPalette?: () => void }).__openPalette?.()}
          aria-label="Open command palette"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-muted hover:bg-elevated md:px-3"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">Search</span>
          <kbd className="hidden rounded border border-border px-1 text-xs lg:inline">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
