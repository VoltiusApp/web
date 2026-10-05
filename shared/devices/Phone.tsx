import React from 'react';
import { flat } from './Laptop';

const TEXT = '#f4f5f8';
const SAFE = { top: 58, bottom: 46 };
const BEZEL = 13;
const R = 54;

/** Android phone standing at (x, y, z); `screen` is laid out at app size (appW × appH) and scaled down. */
export const Phone: React.FC<{
  on: number;
  x: number;
  y: number;
  z?: number;
  appW?: number;
  appH?: number;
  scale?: number;
  tilt?: { x: number; y: number };
  screen: React.ReactNode;
}> = ({ on, x, y, z = 0, appW = 412, appH = 892, scale = 0.74, tilt = { x: 7, y: -16 }, screen }) => {
  const screenW = appW * scale;
  const screenH = (appH + SAFE.top + SAFE.bottom) * scale;
  const w = screenW + BEZEL * 2;
  const h = screenH + BEZEL * 2;
  return (
    <div style={{ ...flat, left: '50%', top: '50%', transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
      <div style={{ ...flat, left: -w / 2 - 30, top: -60, width: w + 60, height: 200, transformOrigin: '50% 60px', transform: 'rotateX(90deg)', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 70%)', filter: 'blur(18px)' }} />
      <div style={{ ...flat, left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%', transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: R, background: '#07080a', boxShadow: 'inset 0 0 0 2px #3a3f48, 0 0 0 4px #23262c, 0 0 0 5px #4a4f58' }}>
          <div style={{ position: 'absolute', left: BEZEL, top: BEZEL, width: screenW, height: screenH, overflow: 'hidden', borderRadius: R - BEZEL, background: '#000' }}>
            <div style={{ width: appW, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              <div style={{ height: SAFE.top, background: '#131c2c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 34px 0', boxSizing: 'border-box', fontWeight: 600, fontSize: 17, color: TEXT }}>
                <span>9:41</span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 16, height: 11, borderRadius: 2, background: TEXT, clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
                  <span style={{ width: 24, height: 12, borderRadius: 3, border: `1.5px solid ${TEXT}`, padding: 1.5, boxSizing: 'border-box' }}>
                    <span style={{ display: 'block', width: '70%', height: '100%', borderRadius: 1, background: TEXT }} />
                  </span>
                </span>
              </div>
              <div style={{ position: 'relative', height: appH, overflow: 'hidden' }}>{screen}</div>
              <div style={{ height: SAFE.bottom, background: '#161f30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 130, height: 5, borderRadius: 3, background: 'rgba(244,245,248,0.75)' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 1 - on }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)' }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: BEZEL + 14, width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 2px #111' }} />
        </div>
        <div style={{ position: 'absolute', right: -7, top: 170, width: 5, height: 90, borderRadius: 3, background: '#3a3f48' }} />
        <div style={{ position: 'absolute', right: -7, top: 290, width: 5, height: 56, borderRadius: 3, background: '#3a3f48' }} />
      </div>
    </div>
  );
};
