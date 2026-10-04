import React from 'react';
import { Img, staticFile } from 'remotion';

export const Logo: React.FC<{ size: number; glow?: number; style?: React.CSSProperties }> = ({ size, glow = 1, style }) => (
  <div style={{ position: 'relative', width: size, height: size, ...style }}>
    <div
      style={{
        position: 'absolute',
        inset: -size * 0.35,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(34,211,238,${0.45 * glow}) 0%, rgba(59,130,246,${0.2 * glow}) 35%, transparent 68%)`,
      }}
    />
    <Img src={staticFile('logo.png')} style={{ position: 'relative', width: size, height: size }} />
  </div>
);
