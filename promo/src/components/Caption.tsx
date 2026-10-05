import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { C, SANS } from '../theme';

export type CaptionCue = { from: number; to: number; text: React.ReactNode };

export const accented = (text: string, accent?: string): React.ReactNode => (accent ? <>{text} <span style={{ color: C.cyan }}>{accent}</span></> : text);

/** One cue at a time, frames in and out; the last cue stays up. */
export const Caption: React.FC<{ cues: CaptionCue[]; frame: number; size?: number }> = ({ cues, frame, size = 60 }) => {
  const { fps } = useVideoConfig();
  const c = cues.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const inP = spring({ frame: frame - c.from, fps, config: { damping: 200 }, durationInFrames: 14 });
  const outP = interpolate(frame, [c.to - 8, c.to], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const last = c === cues[cues.length - 1];
  return (
    <div style={{ opacity: inP * (last ? 1 : outP), transform: `translateY(${(1 - inP) * 16}px)`, fontFamily: SANS, fontWeight: 700, fontSize: size, color: C.text, letterSpacing: -1.4 }}>
      {c.text}
    </div>
  );
};
