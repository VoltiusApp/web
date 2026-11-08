import React, { createContext, useContext, useMemo } from 'react';

type Segment = { x: number; y: number; len: number; angle: number };

const rim = (w: number, h: number, r: number, steps: number): Segment[] => {
  const pts: [number, number][] = [];
  const arc = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= steps; i++) {
      const a = from + (i / steps) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  arc(w - r, r, -Math.PI / 2);
  arc(w - r, h - r, 0);
  arc(r, h - r, Math.PI / 2);
  arc(r, r, Math.PI);
  return pts.map(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2, len: Math.hypot(x2 - x1, y2 - y1) + 0.8, angle: Math.atan2(y2 - y1, x2 - x1) };
  });
};

// Wall segments per rounded corner; each one is a separate 3D layer for the compositor.
export const SlabCornerSteps = createContext(6);

const LIGHT = -Math.PI * 0.75;
// The path runs clockwise in screen coords, so a wall's outward normal is its direction turned -90°.
const shade = (angle: number) => 0.55 + 0.45 * Math.cos(angle - Math.PI / 2 - LIGHT);

export const Slab: React.FC<{
  w: number;
  h: number;
  t: number;
  r: number;
  wall: (light: number) => string;
  front: React.CSSProperties;
  back: React.CSSProperties;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ w, h, t, r, wall, front, back, children, style }) => {
  const steps = useContext(SlabCornerSteps);
  const segments = useMemo(() => rim(w, h, r, steps), [w, h, r, steps]);
  return (
    <div style={{ position: 'absolute', width: w, height: h, transformStyle: 'preserve-3d', ...style }}>
      {segments.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x - s.len / 2, top: s.y - t / 2, width: s.len, height: t, transform: `rotateZ(${s.angle}rad) rotateX(90deg)`, backfaceVisibility: 'hidden', background: wall(shade(s.angle)) }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, transform: `rotateY(180deg) translateZ(${t / 2}px)`, ...back }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, transform: `translateZ(${t / 2}px)`, ...front }}>{children}</div>
    </div>
  );
};
