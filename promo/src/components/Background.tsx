import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from '../theme';

export const Background: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: 1600,
          height: 1600,
          left: -620 + Math.sin(t * 0.35) * 90,
          top: -820 + Math.cos(t * 0.28) * 70,
          background: 'radial-gradient(circle, rgba(34,211,238,0.20) 0%, rgba(59,130,246,0.08) 35%, transparent 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          right: -700 + Math.cos(t * 0.3) * 80,
          bottom: -900 + Math.sin(t * 0.22) * 60,
          background: 'radial-gradient(circle, rgba(251,146,60,0.13) 0%, rgba(251,146,60,0.04) 38%, transparent 62%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.2px, transparent 1.2px)',
          backgroundSize: '34px 34px',
          backgroundPosition: `0px ${(t * 6) % 34}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 100%)',
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
    </AbsoluteFill>
  );
};
