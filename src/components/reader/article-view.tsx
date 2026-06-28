'use client';
import { useEffect, useRef, useState } from 'react';
import { markReadAction, deleteArticleAction } from '@/server/actions/articles';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { Check, Trash2, ALargeSmall, Sun, Moon, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  title: string;
  byline: string | null;
  siteName: string | null;
  sourceUrl: string;
  contentHtml: string;
  wordCount: number;
  alreadyRead: boolean;
}

type Theme = 'light' | 'sepia' | 'dark';
type Family = 'serif' | 'sans';

export function ArticleView(props: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const [family, setFamily] = useState<Family>('serif');
  const [size, setSize] = useState(1.125);
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = (localStorage.getItem('reader.theme') as Theme | null) ?? 'light';
    const f = (localStorage.getItem('reader.family') as Family | null) ?? 'serif';
    const s = Number(localStorage.getItem('reader.size') ?? '1.125');
    setTheme(t); setFamily(f); setSize(s);
  }, []);

  useEffect(() => {
    localStorage.setItem('reader.theme', theme);
    localStorage.setItem('reader.family', family);
    localStorage.setItem('reader.size', String(size));
  }, [theme, family, size]);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const readingMinutes = Math.max(1, Math.round(props.wordCount / 220));

  return (
    <div
      className={cn(
        'rounded-xl border border-border p-6 transition-colors sm:p-10',
        theme === 'sepia' && 'reader-sepia',
        theme === 'dark' && 'bg-bg',
        theme === 'light' && 'bg-surface',
      )}
    >
      <div
        className="fixed inset-x-0 top-0 z-30 h-1 bg-elevated"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <header className="mx-auto max-w-3xl">
        <p className="text-sm text-muted">
          {props.siteName ?? new URL(props.sourceUrl).hostname}
          {props.byline ? ` · ${props.byline}` : ''}
          {` · ${readingMinutes} min read`}
        </p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight">{props.title}</h1>
      </header>

      <div className="mx-auto my-6 flex max-w-3xl flex-wrap items-center gap-3 text-sm">
        <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-md border border-border p-0.5">
          {(['light', 'sepia', 'dark'] as const).map((t) => {
            const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Coffee;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                aria-label={t}
                onClick={() => setTheme(t)}
                className={cn('inline-flex h-8 w-8 items-center justify-center rounded', theme === t && 'bg-elevated')}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            );
          })}
        </div>
        <div role="radiogroup" aria-label="Font family" className="inline-flex rounded-md border border-border p-0.5">
          {(['serif', 'sans'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={family === f}
              onClick={() => setFamily(f)}
              className={cn('h-8 rounded px-3 capitalize', family === f && 'bg-elevated')}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5">
          <ALargeSmall className="ml-2 h-4 w-4 text-muted" aria-hidden />
          <button type="button" aria-label="Smaller text" onClick={() => setSize((s) => Math.max(0.875, s - 0.0625))} className="h-8 w-8 rounded hover:bg-elevated">−</button>
          <button type="button" aria-label="Larger text" onClick={() => setSize((s) => Math.min(1.625, s + 0.0625))} className="h-8 w-8 rounded hover:bg-elevated">+</button>
        </div>
        <a
          href={props.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm text-accent underline underline-offset-2"
        >
          View original
        </a>
      </div>

      <div
        ref={ref}
        className={cn('prose-reader', family === 'serif' ? 'reader-serif' : 'reader-sans')}
        style={{ fontSize: `${size}rem` }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: props.contentHtml }}
      />

      <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          variant="secondary"
          onClick={() => { void markReadAction(props.id); }}
          disabled={props.alreadyRead}
        >
          <Check className="h-4 w-4" aria-hidden />
          {props.alreadyRead ? 'Marked read' : 'Mark as read'}
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            if (!confirm('Delete this archived article?')) return;
            await deleteArticleAction(props.id);
            router.push('/library/articles');
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </Button>
      </div>
    </div>
  );
}
