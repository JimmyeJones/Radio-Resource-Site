'use client';
import { useEffect, useRef, useState } from 'react';
import { updateProgressAction } from '@/server/actions/videos';
import { playerBus } from './player-bus';

interface Props {
  videoId: string;
  hasSubs: boolean;
  initialProgress: number;
  title: string;
}

export function VideoPlayer({ videoId, hasSubs, initialProgress, title }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [showTrack, setShowTrack] = useState(hasSubs);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (initialProgress > 0) {
      const handler = () => {
        el.currentTime = initialProgress;
        el.removeEventListener('loadedmetadata', handler);
      };
      el.addEventListener('loadedmetadata', handler);
    }
    let lastSaved = initialProgress;
    const onTime = () => {
      if (Math.abs(el.currentTime - lastSaved) >= 10) {
        lastSaved = el.currentTime;
        void updateProgressAction(videoId, el.currentTime).catch(() => undefined);
      }
    };
    el.addEventListener('timeupdate', onTime);

    // Expose seek/current-time to sibling transcript & bookmark controls.
    playerBus.seek = (s: number) => {
      el.currentTime = s;
      void el.play().catch(() => undefined);
    };
    playerBus.getTime = () => el.currentTime;

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          el.paused ? el.play() : el.pause();
          break;
        case 'ArrowLeft':
          el.currentTime = Math.max(0, el.currentTime - 5);
          break;
        case 'ArrowRight':
          el.currentTime = Math.min(el.duration, el.currentTime + 5);
          break;
        case 'ArrowUp':
          el.volume = Math.min(1, el.volume + 0.1);
          break;
        case 'ArrowDown':
          el.volume = Math.max(0, el.volume - 0.1);
          break;
        case 'm':
          el.muted = !el.muted;
          break;
        case 'c':
          setShowTrack((s) => !s);
          break;
        case 'f':
          if (!document.fullscreenElement) el.requestFullscreen().catch(() => undefined);
          else void document.exitFullscreen().catch(() => undefined);
          break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      document.removeEventListener('keydown', onKey);
      playerBus.seek = null;
      playerBus.getTime = null;
    };
  }, [initialProgress, videoId]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        src={`/api/stream/${videoId}`}
        controls
        playsInline
        preload="metadata"
        aria-label={`Video: ${title}`}
        className="aspect-video w-full bg-black"
      >
        {hasSubs && showTrack ? (
          <track default kind="captions" srcLang="en" src={`/api/subs/${videoId}`} label="English" />
        ) : (
          <track kind="captions" srcLang="en" label="No captions available" />
        )}
      </video>
    </div>
  );
}
