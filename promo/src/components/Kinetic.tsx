import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_GRADIENT, C, MONO, SANS } from '../theme';

export type Word = { t: string; accent?: boolean; strikeAt?: number };

export const words = (plain: string, accent?: string): Word[] => [
  ...plain.split(' ').filter(Boolean).map((t) => ({ t })),
  ...(accent ? accent.split(' ').map((t) => ({ t, accent: true })) : []),
];

export const KineticLine: React.FC<{
  items: Word[];
  delay?: number;
  size?: number;
  weight?: number;
  stagger?: number;
  color?: string;
  exitAt?: number;
}> = ({ items, delay = 0, size = 78, weight = 700, stagger = 3, color = C.text, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.26}px`, fontFamily: SANS, fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', lineHeight: 1.08 }}>
      {items.map((w, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 18, stiffness: 140, mass: 0.7 } });
        const strike = w.strikeAt === undefined ? 0 : interpolate(frame, [w.strikeAt, w.strikeAt + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <span key={i} style={{ overflow: 'hidden', display: 'inline-block', paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                transform: `translateY(${(1 - p) * 105 + exit * -105}%)`,
                opacity: Math.min(1, p * 1.4) * (1 - exit),
                color: w.accent ? 'transparent' : color,
                backgroundImage: w.accent ? ACCENT_GRADIENT : undefined,
                WebkitBackgroundClip: w.accent ? 'text' : undefined,
                backgroundClip: w.accent ? 'text' : undefined,
              }}
            >
              {w.t}
              {strike > 0 && (
                <span style={{ position: 'absolute', left: '-4%', top: '50%', height: size * 0.08, width: `${strike * 108}%`, borderRadius: size, background: C.orange, boxShadow: `0 0 18px ${C.orange}` }} />
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const spacing = interpolate(frame - delay, [0, 20], [0.5, 0.28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: o, fontFamily: MONO, fontSize: 21, fontWeight: 500, color: C.cyan, letterSpacing: `${spacing}em`, textTransform: 'uppercase' }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}` }} />
      {text}
    </div>
  );
};
