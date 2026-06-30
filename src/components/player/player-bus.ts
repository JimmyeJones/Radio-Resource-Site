// Tiny client-side bus so the transcript and bookmark controls can drive the
// video player without prop-drilling. All consumers are client components in
// the same browser module instance.
export const playerBus: {
  seek: ((seconds: number) => void) | null;
  getTime: (() => number) | null;
} = {
  seek: null,
  getTime: null,
};
