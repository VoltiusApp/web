import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Logo } from '../components/Logo';
import { ACCENT_GRADIENT, C, MONO, SANS } from '../theme';

const STATS = [
  { big: '~40 MB', small: 'Native Rust + Tauri' },
  { big: '0', small: 'accounts required' },
  { big: 'E2EE', small: 'zero-knowledge sync' },
  { big: 'AGPLv3', small: 'fully open source' },
];

export const Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 34 }}>
        {STATS.map((s, i) => {
          const p = spring({ frame: frame - i * 5, fps, config: { damping: 16, stiffness: 130 } });
          return (
            <div key={s.big} style={{ width: 370, padding: '44px 36px', whiteSpace: 'nowrap', borderRadius: 28, background: C.card, border: `1px solid ${C.line}`, transform: `translateY(${(1 - p) * 70}px)`, opacity: p }}>
              <div style={{ fontFamily: SANS, fontSize: 76, fontWeight: 800, letterSpacing: '-0.05em', color: 'transparent', backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{s.big}</div>
              <div style={{ fontFamily: SANS, fontSize: 28, color: C.muted, marginTop: 6 }}>{s.small}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ headline?: string }> = ({ headline = 'Free · Open source · No account required' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const fade = (d: number) => interpolate(frame - d, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const platforms = ['Windows', 'macOS', 'Linux', 'Android'];
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, transform: `scale(${0.85 + p * 0.15})`, opacity: p }}>
        <Logo size={170} />
        <div style={{ fontFamily: SANS, fontSize: 150, fontWeight: 800, letterSpacing: '-0.05em', color: C.text }}>Voltius</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 38, fontWeight: 500, color: C.text, marginTop: 40, opacity: fade(10) }}>{headline}</div>
      <div style={{ display: 'flex', gap: 14, marginTop: 34, opacity: fade(18) }}>
        {platforms.map((pl) => (
          <div key={pl} style={{ fontFamily: SANS, fontSize: 24, color: C.muted, padding: '9px 22px', borderRadius: 999, border: `1px solid ${C.line}` }}>{pl}</div>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 600, marginTop: 56, color: 'transparent', backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', opacity: fade(26), transform: `translateY(${(1 - fade(26)) * 20}px)` }}>
        voltius.app
      </div>
    </AbsoluteFill>
  );
};
