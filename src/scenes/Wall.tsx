import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { KineticLine, words } from '../components/Kinetic';
import { C, SANS } from '../theme';

const FEATURES = [
  'Port forwarding', 'Snippets', 'Jump hosts', 'Docker',
  'Proxmox LXC', 'Serial consoles', 'Team vaults', 'MCP server for AI agents',
  'Plugins', 'Sessions that survive restarts', 'Local shells', 'Live system metrics',
];

export const Wall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <KineticLine items={words('And everything else', 'you need.')} size={76} />
      </div>
      <div style={{ position: 'absolute', top: 380, left: 160, right: 160, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {FEATURES.map((f, i) => {
          const p = spring({ frame: frame - 10 - i * 2.5, fps, config: { damping: 14, stiffness: 170 } });
          const lit = interpolate((frame - 10 - i * 2.5) % 60, [0, 8, 30], [1, 0.25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div
              key={f}
              style={{
                fontFamily: SANS,
                fontSize: 34,
                fontWeight: 600,
                color: C.text,
                padding: '20px 34px',
                borderRadius: 999,
                background: 'rgba(17,19,28,0.85)',
                border: `1px solid rgba(34,211,238,${0.18 + lit * 0.5})`,
                boxShadow: `0 0 ${20 + lit * 30}px rgba(34,211,238,${0.06 + lit * 0.25})`,
                transform: `scale(${0.6 + p * 0.4}) translateY(${(1 - p) * 30}px)`,
                opacity: Math.min(1, p * 1.5),
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
