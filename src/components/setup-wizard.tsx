'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SEED_CATALOG } from '@/lib/seed-catalog';
import { completeSetupAction, skipSetupAction, type SetupSelection } from '@/server/actions/setup';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { topicLabel } from '@/lib/topics';
import { Youtube, Link2, Check } from 'lucide-react';

type ChannelState = Record<string, { hub: boolean; subscribe: boolean; auto: boolean }>;
type LinkState = Record<string, boolean>;

export function SetupWizard() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const [channels, setChannels] = useState<ChannelState>(() => {
    const init: ChannelState = {};
    for (const cat of SEED_CATALOG) for (const ch of cat.channels) init[ch.url] = { hub: true, subscribe: false, auto: false };
    return init;
  });
  const [links, setLinks] = useState<LinkState>(() => {
    const init: LinkState = {};
    for (const cat of SEED_CATALOG) for (const l of cat.links) init[l.url] = true;
    return init;
  });
  const [extraChannels, setExtraChannels] = useState('');
  const [extraLinks, setExtraLinks] = useState('');

  function setCh(url: string, patch: Partial<ChannelState[string]>) {
    setChannels((s) => ({ ...s, [url]: { ...s[url], ...patch } }));
  }

  function submit() {
    const selection: SetupSelection = {
      channels: SEED_CATALOG.flatMap((c) => c.channels).map((ch) => ({
        url: ch.url,
        name: ch.name,
        topics: ch.topics,
        hub: channels[ch.url]?.hub ?? false,
        subscribe: channels[ch.url]?.subscribe ?? false,
        auto: channels[ch.url]?.auto ?? false,
      })),
      links: SEED_CATALOG.flatMap((c) => c.links).map((l) => ({
        title: l.title,
        url: l.url,
        kind: l.kind,
        tags: l.tags,
        add: links[l.url] ?? false,
      })),
      extraChannels: extraChannels.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
      extraLinks: extraLinks
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [url, ...rest] = line.split(/\s+/);
          return { url, title: rest.join(' ') };
        }),
    };
    start(async () => {
      const res = await completeSetupAction(selection);
      if (res?.ok) {
        if (res.errors.length) {
          setResult(`Added ${res.hubAdded} links, subscribed to ${res.subscribed}. Some channels couldn't be resolved: ${res.errors.join('; ')}`);
        } else {
          router.push('/');
        }
      }
    });
  }

  function skip() {
    start(async () => {
      await skipSetupAction();
      router.push('/');
    });
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-surface to-elevated p-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome — let’s seed your library</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Pick channels and references to get started. Add to your hub for quick links, or subscribe to
          download new uploads automatically. You can change everything later.
        </p>
      </div>

      <div className="space-y-8">
        {SEED_CATALOG.map((cat) => (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <h2 id={`cat-${cat.id}`} className="text-lg font-semibold">{cat.label}</h2>
            <p className="mb-3 text-sm text-muted">{cat.blurb}</p>

            {cat.channels.length > 0 ? (
              <ul className="mb-3 grid gap-3 lg:grid-cols-2">
                {cat.channels.map((ch) => {
                  const st = channels[ch.url];
                  return (
                    <li key={ch.url}>
                      <Card>
                        <div className="flex items-start gap-3">
                          <Youtube className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base">{ch.name}</CardTitle>
                            <CardDescription className="mt-0.5">{ch.note}</CardDescription>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {ch.topics.map((t) => (
                                <Badge key={t}>{topicLabel(t)}</Badge>
                              ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              <label className="inline-flex items-center gap-1.5">
                                <input type="checkbox" className="h-4 w-4 accent-accent" checked={st.hub} onChange={(e) => setCh(ch.url, { hub: e.target.checked })} />
                                Add to hub
                              </label>
                              <label className="inline-flex items-center gap-1.5">
                                <input type="checkbox" className="h-4 w-4 accent-accent" checked={st.subscribe} onChange={(e) => setCh(ch.url, { subscribe: e.target.checked })} />
                                Subscribe
                              </label>
                              <label className={`inline-flex items-center gap-1.5 ${st.subscribe ? '' : 'opacity-40'}`}>
                                <input type="checkbox" className="h-4 w-4 accent-accent" disabled={!st.subscribe} checked={st.auto} onChange={(e) => setCh(ch.url, { auto: e.target.checked })} />
                                Auto-download
                              </label>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {cat.links.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.links.map((l) => (
                  <li key={l.url}>
                    <label className="flex h-full cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm hover:border-accent">
                      <input
                        type="checkbox"
                        aria-label={l.title}
                        className="mt-0.5 h-4 w-4 accent-accent"
                        checked={links[l.url] ?? false}
                        onChange={(e) => setLinks((s) => ({ ...s, [l.url]: e.target.checked }))}
                      />
                      <span>
                        <span className="flex items-center gap-1 font-medium">
                          <Link2 className="h-3.5 w-3.5 text-accent" aria-hidden /> {l.title}
                        </span>
                        <span className="text-muted">{l.note}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section aria-labelledby="extras">
          <h2 id="extras" className="text-lg font-semibold">Add your own</h2>
          <p className="mb-3 text-sm text-muted">Channels are subscribed; links go to your hub.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label htmlFor="extra-channels" className="mb-1 block text-sm font-medium">Channel URLs (one per line)</label>
              <textarea
                id="extra-channels"
                value={extraChannels}
                onChange={(e) => setExtraChannels(e.target.value)}
                rows={4}
                placeholder="https://www.youtube.com/@somechannel"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="extra-links" className="mb-1 block text-sm font-medium">Links (URL, then optional title)</label>
              <textarea
                id="extra-links"
                value={extraLinks}
                onChange={(e) => setExtraLinks(e.target.value)}
                rows={4}
                placeholder="https://example.com  My favourite reference"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>
        </section>
      </div>

      {result ? (
        <p role="status" aria-live="polite" className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          {result}{' '}
          <button type="button" className="underline" onClick={() => router.push('/')}>Continue to dashboard</button>
        </p>
      ) : null}

      <div className="sticky bottom-0 mt-8 flex items-center gap-3 border-t border-border bg-bg/90 py-4 backdrop-blur">
        <Button onClick={submit} disabled={pending}>
          <Check className="h-4 w-4" aria-hidden /> {pending ? 'Setting up…' : 'Finish setup'}
        </Button>
        <Button variant="ghost" onClick={skip} disabled={pending}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
