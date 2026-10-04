import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { KineticLine, words } from '../components/Kinetic';
import { Logo } from '../components/Logo';
import { C, MONO, SANS } from '../theme';

const CMD = 'ssh deploy@prod-web-01';
const TYPE_START = 8;
const CHAR = 1.6;
const ENTER = TYPE_START + Math.ceil(CMD.length * CHAR) + 8;
const STRIKE = ENTER + 8;

const Bolt: React.FC<{ seed: number; progress: number }> = ({ seed, progress }) => {
  const angle = random(`a${seed}`) * Math.PI * 2;
  const len = 260 + random(`l${seed}`) * 380;
  const pts: string[] = [];
  const segs = 7;
  for (let i = 0; i <= segs; i++) {
    const d = (len * i) / segs;
    const j = i === 0 ? 0 : (random(`j${seed}-${i}`) - 0.5) * 60;
    const x = 960 + Math.cos(angle) * (110 + d) - Math.sin(angle) * j;
    const y = 470 + Math.sin(angle) * (110 + d) + Math.cos(angle) * j;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const o = interpolate(progress, [0, 0.15, 1], [0, 1, 0], { extrapolateRight: 'clamp' });
  return <polyline points={pts.join(' ')} fill="none" stroke={random(`c${seed}`) > 0.75 ? C.orange : C.cyan} strokeWidth={2.5} strokeLinejoin="round" opacity={o} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} strokeDasharray={len + 300} strokeDashoffset={(1 - Math.min(1, progress * 2.5)) * (len + 300)} />;
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = CMD.slice(0, Math.max(0, Math.floor((frame - TYPE_START) / CHAR)));
  const cursorOn = Math.floor(frame / 8) % 2 === 0 || (frame > TYPE_START && frame < ENTER);
  const termOut = interpolate(frame, [ENTER, ENTER + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glitch = frame >= ENTER && frame < ENTER + 8 ? (random(`g${frame}`) - 0.5) * 40 : 0;
  const flash = interpolate(frame, [STRIKE - 1, STRIKE, STRIKE + 10], [0, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoP = spring({ frame: frame - STRIKE, fps, config: { damping: 11, stiffness: 120, mass: 0.8 } });
  const lockup = spring({ frame: frame - STRIKE - 22, fps, config: { damping: 20, stiffness: 110 } });
  const name = 'Voltius';
  return (
    <AbsoluteFill>
      {termOut > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: termOut }}>
          <div style={{ fontFamily: MONO, fontSize: 54, color: C.text, transform: `translateX(${glitch}px)`, textShadow: glitch ? `${-glitch / 4}px 0 ${C.cyan}, ${glitch / 4}px 0 ${C.orange}` : undefined }}>
            <span style={{ color: C.green }}>~</span>
            <span style={{ color: C.cyan }}> ❯ </span>
            {typed}
            <span style={{ display: 'inline-block', width: 28, height: 58, marginLeft: 4, verticalAlign: -10, background: cursorOn ? C.cyan : 'transparent' }} />
          </div>
        </AbsoluteFill>
      )}
      {frame >= STRIKE - 2 && (
        <AbsoluteFill>
          <svg width={1920} height={1080} style={{ position: 'absolute' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Bolt key={i} seed={i} progress={interpolate(frame - STRIKE - i * 0.7, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
            ))}
          </svg>
          <div style={{ position: 'absolute', left: 960 - 105, top: 470 - 105 - lockup * 70, transform: `scale(${0.4 + logoP * 0.6}) rotate(${(1 - logoP) * -12}deg)`, opacity: Math.min(1, logoP * 2) }}>
            <Logo size={210} glow={1 + flash} />
          </div>
          <div style={{ position: 'absolute', top: 640 - lockup * 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: '-0.05em', color: C.text }}>
            {name.split('').map((ch, i) => {
              const p = spring({ frame: frame - STRIKE - 18 - i * 2, fps, config: { damping: 16, stiffness: 160 } });
              return (
                <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)` }}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ position: 'absolute', top: 820 - lockup * 60, left: 0, right: 0 }}>
            <KineticLine items={words('Fast by design.', 'Private by default.')} delay={STRIKE + 34} size={50} weight={600} stagger={3} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: 'white', opacity: flash, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

export const INTRO_FRAMES = STRIKE + 80;
