import React from 'react';
import { Easing, interpolate, OffthreadVideo, Series, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS } from '../theme';

export const SRC_W = 1440;
export const SRC_H = 900;

export type Segment = { from: number; to: number; rate?: number };

const segFrames = (s: Segment) => Math.round(((s.to - s.from) * FPS) / (s.rate ?? 1));
export const footageFrames = (segs: Segment[]) => segs.reduce((n, s) => n + segFrames(s), 0);

export const Footage: React.FC<{ src: string; segments: Segment[] }> = ({ src, segments }) => (
  <Series>
    {segments.map((s, i) => (
      <Series.Sequence key={i} durationInFrames={segFrames(s)}>
        <OffthreadVideo
          src={staticFile(src)}
          trimBefore={Math.round(s.from * FPS)}
          playbackRate={s.rate ?? 1}
          muted
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Series.Sequence>
    ))}
  </Series>
);

export type Zoom = { start: number; end: number; scale: number; x: number; y: number; ramp?: number };

const zoomAt = (frame: number, zooms: Zoom[]) => {
  for (const z of zooms) {
    if (frame < z.start || frame > z.end) continue;
    const r = z.ramp ?? 30;
    const s = interpolate(frame, [z.start, z.start + r, z.end - r, z.end], [1, z.scale, z.scale, 1], {
      easing: Easing.inOut(Easing.sin),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { s, x: z.x, y: z.y };
  }
  return { s: 1, x: SRC_W / 2, y: SRC_H / 2 };
};

export const AppWindow: React.FC<{
  src: string;
  segments: Segment[];
  width?: number;
  top?: number;
  zooms?: Zoom[];
  enterDelay?: number;
}> = ({ src, segments, width = 1400, top = 228, zooms = [], enterDelay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps, width: compW } = useVideoConfig();
  const k = width / SRC_W;
  const height = SRC_H * k;
  const enter = spring({ frame: frame - enterDelay, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
  const drift = interpolate(frame, [0, 600], [0, -18]);
  const z = zoomAt(frame, zooms);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: compW, height: '100%', perspective: 2200 }}>
      <div
        style={{
          position: 'absolute',
          left: (compW - width) / 2,
          top,
          width,
          height,
          transform: `translateY(${(1 - enter) * 420 + drift}px) rotateX(${(1 - enter) * 22}deg) scale(${(0.9 + enter * 0.1) * z.s})`,
          transformOrigin: `${z.x * k}px ${z.y * k}px`,
          opacity: Math.min(1, enter * 1.5),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -60,
            borderRadius: 60,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.22), transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 50px 140px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.10)',
            background: '#0b0f17',
          }}
        >
          <Footage src={src} segments={segments} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }} />
        </div>
      </div>
    </div>
  );
};
