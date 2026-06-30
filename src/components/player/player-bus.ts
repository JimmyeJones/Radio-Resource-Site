// Tiny client-side bus so the transcript and bookmark controls can drive the
// video player (and follow its playhead) without prop-drilling. All consumers
// are client components in the same browser module instance.
type TimeListener = (seconds: number) => void;

const timeListeners = new Set<TimeListener>();

export const playerBus: {
  seek: ((seconds: number) => void) | null;
  getTime: (() => number) | null;
  /** Subscribe to playhead updates; returns an unsubscribe fn. */
  onTime: (fn: TimeListener) => () => void;
  /** Called by the player on timeupdate. */
  emitTime: (seconds: number) => void;
} = {
  seek: null,
  getTime: null,
  onTime(fn) {
    timeListeners.add(fn);
    return () => timeListeners.delete(fn);
  },
  emitTime(seconds) {
    for (const fn of timeListeners) fn(seconds);
  },
};
