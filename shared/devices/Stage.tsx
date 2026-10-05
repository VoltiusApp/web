import React from 'react';
import { flat } from './Laptop';

export type Cam = { x: number; y: number; s: number; rx: number; ry: number };

/** A 1920×1080 perspective box; scale its parent to fit other sizes. */
export const Stage: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <div style={{ position: 'absolute', inset: 0, perspective: 4200, perspectiveOrigin: '50% 40%' }}>
    <div style={{ ...flat, inset: 0, transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)` }}>{children}</div>
  </div>
);
