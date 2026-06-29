import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Nav } from '@/components/nav';
import { CommandPalette } from '@/components/command-palette';

export const metadata: Metadata = {
  title: { default: 'Radio Resource Site', template: '%s · Radio Resource' },
  description:
    'Self-hosted distraction-free library for ham radio, satellites, and radio astronomy content.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0e74bc' },
    { media: '(prefers-color-scheme: dark)', color: '#080b13' },
  ],
};

const themeBoot = `
(function(){
  try {
    var t = localStorage.getItem('theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed left-3 top-3 z-50 rounded-md bg-accent px-3 py-2 text-accent-fg"
        >
          Skip to main content
        </a>
        <Nav />
        <CommandPalette />
        <main id="main" className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
        <footer className="mt-16 border-t border-border py-6 text-center text-sm text-muted">
          73 · Self-hosted · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
