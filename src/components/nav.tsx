'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Library, BookmarkPlus, Wrench, Settings, Home, FolderKanban, RadioTower } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './theme-toggle';
import { NavSearch } from './nav-search';

const items = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/library', label: 'Library', Icon: Library },
  { href: '/projects', label: 'Projects', Icon: FolderKanban },
  { href: '/frequencies', label: 'Frequencies', Icon: RadioTower },
  { href: '/hub', label: 'Hub', Icon: BookmarkPlus },
  { href: '/tools', label: 'Tools', Icon: Wrench },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Radio Resource Site, home"
        >
          <Radio className="h-5 w-5 text-accent" aria-hidden />
          <span className="hidden sm:inline">Radio Resource</span>
        </Link>
        <nav aria-label="Primary" className="flex-1">
          <ul className="flex items-center gap-1 text-sm">
            {items.slice(1).map(({ href, label, Icon }) => {
              const active = path === href || (href !== '/' && path.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-fg/80 hover:bg-elevated hover:text-fg',
                      active && 'bg-elevated text-fg font-medium',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <NavSearch />
        <ThemeToggle />
      </div>
    </header>
  );
}
