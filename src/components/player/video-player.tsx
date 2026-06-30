'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { updateProgressAction } from '@/server/actions/videos';
import { playerBus } from './player-bus';
import { Loader2, TriangleAlert } from 'lucide-react';

interface Props {
  videoId: string;
  hasSubs: boolean;
  initialProgress: number;
  title: string;
}

const VOL_KEY = 'rr.player.volume';
const MUTE_KEY = 'rr.player.muted';

export function VideoPlayer({ videoId, hasSubs, initialProgress, title }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const lastSaved = useRef(initialProgress);

  const save = useCallback(
    (seconds: number) => {
      lastSaved.current = seconds;
      void updateProgressAction(videoId, Math.floor(seconds)).catch(() => undefined);
    },
    [videoId],
  );

  // Wire up the media element: progress, volume memory, resume, status.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Restore the viewer's last volume/mute choice across videos.
    try {
      const v = localStorage.getItem(VOL_KEY);
      if (v != null && !Number.isNaN(Number(v))) el.volume = Math.min(1, Math.max(0, Number(v)));
      el.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      /* ignore storage errors */
    }

    const onLoaded = () => {
      setStatus('ready');
      // Resume where we left off, unless we're at the very start or basically done.
      if (initialProgress > 3 && (!el.duration || initialProgress < el.duration - 5)) {
        try {
          el.currentTime = initialProgress;
        } catch {
          /* seeking may fail before data is ready; harmless */
        }
      }
    };
    const onWaiting = () => setStatus((s) => (s === 'error' ? s : 'loading'));
    const onPlayable = () => setStatus((s) => (s === 'error' ? s : 'ready'));
    const onError = () => setStatus('error');
    const onVolume = () => {
      try {
        localStorage.setItem(VOL_KEY, String(el.volume));
        localStorage.setItem(MUTE_KEY, el.muted ? '1' : '0');
      } catch {
        /* ignore */
      }
    };
    const onTime = () => {
      playerBus.emitTime(el.currentTime);
      if (Math.abs(el.currentTime - lastSaved.current) >= 5) save(el.currentTime);
    };
    const onPause = () => save(el.currentTime);

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('canplay', onPlayable);
    el.addEventListener('playing', onPlayable);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('error', onError);
    el.addEventListener('volumechange', onVolume);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('pause', onPause);

    // Let the transcript & bookmark controls drive the playhead.
    playerBus.seek = (s: number) => {
      el.currentTime = s;
      void el.play().catch(() => undefined);
    };
    playerBus.getTime = () => el.currentTime;

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('canplay', onPlayable);
      el.removeEventListener('playing', onPlayable);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('error', onError);
      el.removeEventListener('volumechange', onVolume);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('pause', onPause);
      playerBus.seek = null;
      playerBus.getTime = null;
    };
  }, [initialProgress, save]);

  // Reliably flush the final position when the tab is hidden or closed —
  // server actions can't finish during unload, so use sendBeacon.
  useEffect(() => {
    const flush = () => {
      const el = ref.current;
      if (!el || !el.currentTime) return;
      try {
        const body = new Blob([JSON.stringify({ seconds: Math.floor(el.currentTime) })], {
          type: 'application/json',
        });
        navigator.sendBeacon?.(`/api/videos/${videoId}/progress`, body);
      } catch {
        /* best effort */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [videoId]);

  const toggleCaptions = useCallback(() => {
    const el = ref.current;
    const tt = el?.textTracks?.[0];
    if (!tt) return;
    tt.mode = tt.mode === 'showing' ? 'hidden' : 'showing';
  }, []);

  // Player shortcuts are scoped to the player (via container focus), so they
  // never hijack page scrolling or global shortcuts like ⌘K and "/".
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave global shortcuts alone
      const dur = el.duration || Infinity;
      let handled = true;
      switch (e.key) {
        case ' ':
        case 'k':
          if (el.paused) void el.play().catch(() => undefined);
          else el.pause();
          break;
        case 'j':
          el.currentTime = Math.max(0, el.currentTime - 10);
          break;
        case 'l':
          el.currentTime = Math.min(dur, el.currentTime + 10);
          break;
        case 'ArrowLeft':
          el.currentTime = Math.max(0, el.currentTime - 5);
          break;
        case 'ArrowRight':
          el.currentTime = Math.min(dur, el.currentTime + 5);
          break;
        case 'ArrowUp':
          el.volume = Math.min(1, Math.round((el.volume + 0.1) * 100) / 100);
          break;
        case 'ArrowDown':
          el.volume = Math.max(0, Math.round((el.volume - 0.1) * 100) / 100);
          break;
        case 'm':
          el.muted = !el.muted;
          break;
        case 'c':
          toggleCaptions();
          break;
        case 'f':
          if (!document.fullscreenElement) void el.requestFullscreen?.().catch(() => undefined);
          else void document.exitFullscreen?.().catch(() => undefined);
          break;
        case 'Home':
          el.currentTime = 0;
          break;
        case 'End':
          if (el.duration) el.currentTime = el.duration;
          break;
        default:
          if (e.key >= '0' && e.key <= '9' && el.duration) {
            el.currentTime = el.duration * (Number(e.key) / 10);
          } else {
            handled = false;
          }
      }
      if (handled) e.preventDefault();
    },
    [toggleCaptions],
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black focus-within:ring-2 focus-within:ring-accent">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        src={`/api/stream/${videoId}`}
        controls
        playsInline
        preload="metadata"
        onKeyDown={onKeyDown}
        aria-label={`Video: ${title}`}
        className="aspect-video w-full bg-black"
      >
        {hasSubs ? (
          <track default kind="captions" srcLang="en" src={`/api/subs/${videoId}`} label="English" />
        ) : null}
      </video>

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <Loader2 className="h-10 w-10 animate-spin text-white/85 drop-shadow" />
          <span className="sr-only">Loading video…</span>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 p-6 text-center">
          <TriangleAlert className="h-8 w-8 text-amber-400" aria-hidden />
          <p className="max-w-sm text-sm text-white">
            This video couldn’t be played. The download may still be in progress, or the file was moved or removed.
          </p>
        </div>
      ) : null}
    </div>
  );
}
