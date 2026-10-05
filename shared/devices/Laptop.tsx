import React, { memo } from 'react';
import { Slab } from './Slab';

export const SCREEN_W = 1140;
const BEZEL = { side: 16, top: 18, bottom: 26 };
const BASE_T = 20;
const LID_T = 9;
const BODY = { r: 42, base: '#3a4658', light: '#56647a', dark: '#262f3c' };
const bodyFace = `linear-gradient(170deg, ${BODY.light} 0%, ${BODY.base} 55%, ${BODY.dark} 100%)`;
const bodyWall = (k: number) => `rgb(${Math.round(30 + 70 * k)}, ${Math.round(38 + 80 * k)}, ${Math.round(50 + 92 * k)})`;
const NOTCH = { w: 150, h: 14 };
const KEY = 68;

const ROWS: { widths: number[]; h: number }[] = [
  { widths: Array(14).fill(1), h: 0.55 },
  { widths: Array(14).fill(1), h: 1 },
  { widths: [1.5, ...Array(11).fill(1), 1.5], h: 1 },
  { widths: [1.75, ...Array(10).fill(1), 2.25], h: 1 },
  { widths: [2.25, ...Array(9).fill(1), 2.75], h: 1 },
  { widths: [1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1], h: 1 },
];

export const flat: React.CSSProperties = { position: 'absolute', transformStyle: 'preserve-3d' };

const Keyboard: React.FC = () => (
  <div style={{ padding: 10, background: '#0e0f12', borderRadius: 14, display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}>
    {ROWS.map((row, r) => (
      <div key={r} style={{ display: 'flex' }}>
        {row.widths.map((w, i) => (
          <div key={i} style={{ width: w * KEY, height: row.h * KEY, padding: 4, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 8, background: 'linear-gradient(180deg, #2b2e35 0%, #1f2127 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 0 rgba(0,0,0,0.7)' }} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Base = memo(({ lidW, deckD }: { lidW: number; deckD: number }) => (
  <>
    <div style={{ ...flat, left: -lidW / 2 - 60, top: -40, width: lidW + 120, height: deckD + 120, transformOrigin: '50% 40px', transform: 'rotateX(90deg) translateZ(-1px)', borderRadius: 140, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 72%)', filter: 'blur(26px)' }} />
    <Slab
      w={lidW}
      h={deckD}
      t={BASE_T}
      r={BODY.r}
      wall={bodyWall}
      back={{ background: BODY.dark }}
      front={{ background: bodyFace, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      style={{ left: -lidW / 2, top: -BASE_T / 2, transformOrigin: '50% 0', transform: 'rotateX(90deg)' }}
    >
      <div style={{ marginTop: 40 }}>
        <Keyboard />
      </div>
      <div style={{ marginTop: 24, width: 600, height: 270, borderRadius: 16, background: 'linear-gradient(170deg, #4a5770 0%, #3a4658 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.18)' }} />
    </Slab>
    <div style={{ ...flat, left: -lidW / 2 + 90, top: -BASE_T - LID_T - 2, width: lidW - 180, height: LID_T + 3, transform: `translateZ(${-LID_T}px)`, borderRadius: 4, background: '#1c222b' }} />
  </>
));

const LidShell: React.FC<{ lidW: number; lidH: number; children: React.ReactNode }> = ({ lidW, lidH, children }) => (
  <>
    <Slab
      w={NOTCH.w}
      h={NOTCH.h * 2}
      // Thinner than the lid: shared face planes z-fight into a dotted seam across the screen.
      t={LID_T - 4}
      r={NOTCH.h - 1}
      wall={bodyWall}
      back={{ background: bodyFace }}
      front={{ background: '#07080a' }}
      style={{ left: (lidW - NOTCH.w) / 2, top: -NOTCH.h }}
    >
      <div style={{ position: 'absolute', left: '50%', top: 6, width: 7, height: 7, marginLeft: -3.5, borderRadius: '50%', background: '#1b2a3d', boxShadow: '0 0 0 2px #0e1116' }} />
    </Slab>
    <Slab w={lidW} h={lidH} t={LID_T} r={BODY.r - 12} wall={bodyWall} back={{ background: bodyFace, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} front={{ background: '#07080a', boxShadow: 'inset 0 0 0 2px #1d232c' }}>
      {children}
    </Slab>
  </>
);

/** Rounded laptop standing on the floor plane at (x, y). `lid` is the hinge angle: 12 open, -90 shut. */
export const Laptop: React.FC<{ lid: number; x: number; y: number; aspect?: number; screen: React.ReactNode }> = ({ lid, x, y, aspect = 800 / 1280, screen }) => {
  const screenH = SCREEN_W * aspect;
  const lidW = SCREEN_W + BEZEL.side * 2;
  const lidH = screenH + BEZEL.top + BEZEL.bottom;
  return (
    <div style={{ ...flat, left: '50%', top: '50%', transform: `translate3d(${x}px, ${y}px, 0)` }}>
      <Base lidW={lidW} deckD={lidH + 6} />
      <div style={{ ...flat, left: -lidW / 2, top: -BASE_T - LID_T / 2 - 1 - lidH, width: lidW, height: lidH, transformOrigin: '50% 100%', transform: `translateZ(${-LID_T / 2}px) rotateX(${lid}deg)` }}>
        <LidShell lidW={lidW} lidH={lidH}>
          <div style={{ position: 'absolute', left: BEZEL.side, top: BEZEL.top, width: SCREEN_W, height: screenH, overflow: 'hidden', borderRadius: 10, background: '#0a0f1a' }}>
            {screen}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)' }} />
          </div>
        </LidShell>
      </div>
    </div>
  );
};
