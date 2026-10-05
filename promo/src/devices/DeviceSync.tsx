import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { Footage, Segment } from '../components/AppWindow';
import { C, FPS, MONO, SANS, sec } from '../theme';
import { Slab } from './Slab';
import TAKE from './take.json';

const { marks: M, tap: TAP } = TAKE;

const SEGS = (
  [
    [M.laptopEnter + 0.3, 1.6],
    [TAP.at - 1.4, 2.4],
    [TAP.at + 1.55, 1.0],
    [M.deployDone + 0.2, 4.5],
    [M.phoneType - 0.05, 2.0],
    [M.phoneEnter + 0.55, 1.2],
    [M.phoneEnter + 3.05, 1.0],
  ] as const
).reduce<{ from: number; to: number; rate: number; start: number; dur: number }[]>((acc, [to, rate]) => {
  const prev = acc[acc.length - 1];
  const from = prev ? prev.to : M.laptopType - 0.2;
  const start = prev ? prev.start + prev.dur : 0;
  return [...acc, { from, to, rate, start, dur: Math.round(((to - from) / rate) * FPS) }];
}, []);

export const DEVICE_SYNC_FRAMES = SEGS[SEGS.length - 1].start + SEGS[SEGS.length - 1].dur;

const frameAt = (wall: number) => {
  const s = SEGS.find((g) => wall <= g.to) ?? SEGS[SEGS.length - 1];
  return Math.round(s.start + ((wall - s.from) / s.rate) * FPS);
};

const F = {
  lidClose: frameAt(M.laptopEnter + 1.0),
  wake: frameAt(TAP.at - 1.15),
  tap: frameAt(TAP.at),
  lidOpen: frameAt(M.phoneType - 0.65),
};

const segmentsFor = (start: number): Segment[] => SEGS.map((s) => ({ from: s.from - start, to: s.to - start, rate: s.rate }));

const SCREEN = { w: 1140, h: (1140 * TAKE.laptop.h) / TAKE.laptop.w };
const BEZEL = { side: 16, top: 18, bottom: 26 };
const LID = { w: SCREEN.w + BEZEL.side * 2, h: SCREEN.h + BEZEL.top + BEZEL.bottom };
const DECK = { d: LID.h + 6 };
const PHONE_SCALE = 0.74;
const SAFE = { top: 58, bottom: 46 };
const PHONE_SCREEN = { w: TAKE.phone.w * PHONE_SCALE, h: (TAKE.phone.h + SAFE.top + SAFE.bottom) * PHONE_SCALE };
const PHONE_BEZEL = 13;
const PHONE = { w: PHONE_SCREEN.w + PHONE_BEZEL * 2, h: PHONE_SCREEN.h + PHONE_BEZEL * 2, r: 54 };
const LAPTOP_X = -300;
const PHONE_X = 640;
const FLOOR_Y = 330;

const flat: React.CSSProperties = { position: 'absolute', transformStyle: 'preserve-3d' };

const ROWS: { widths: number[]; h: number }[] = [
  { widths: Array(14).fill(1), h: 0.55 },
  { widths: Array(14).fill(1), h: 1 },
  { widths: [1.5, ...Array(11).fill(1), 1.5], h: 1 },
  { widths: [1.75, ...Array(10).fill(1), 2.25], h: 1 },
  { widths: [2.25, ...Array(9).fill(1), 2.75], h: 1 },
  { widths: [1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1], h: 1 },
];
const KEY = 68;

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

const BASE_T = 20;
const LID_T = 9;
const BODY = { r: 42, base: '#3a4658', light: '#56647a', dark: '#262f3c' };
const bodyFace = `linear-gradient(170deg, ${BODY.light} 0%, ${BODY.base} 55%, ${BODY.dark} 100%)`;
const bodyWall = (k: number) => `rgb(${Math.round(30 + 70 * k)}, ${Math.round(38 + 80 * k)}, ${Math.round(50 + 92 * k)})`;
const NOTCH = { w: 150, h: 14 };

const Laptop: React.FC<{ lid: number }> = ({ lid }) => (
  <div style={{ ...flat, left: '50%', top: '50%', transform: `translate3d(${LAPTOP_X}px, ${FLOOR_Y}px, 0)` }}>
    <div style={{ ...flat, left: -LID.w / 2 - 60, top: -40, width: LID.w + 120, height: DECK.d + 120, transformOrigin: '50% 40px', transform: 'rotateX(90deg) translateZ(-1px)', borderRadius: 140, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 72%)', filter: 'blur(26px)' }} />
    <Slab
      w={LID.w}
      h={DECK.d}
      t={BASE_T}
      r={BODY.r}
      wall={bodyWall}
      back={{ background: BODY.dark }}
      front={{ background: bodyFace, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      style={{ left: -LID.w / 2, top: -BASE_T / 2, transformOrigin: '50% 0', transform: 'rotateX(90deg)' }}
    >
      <div style={{ marginTop: 40 }}>
        <Keyboard />
      </div>
      <div style={{ marginTop: 24, width: 600, height: 270, borderRadius: 16, background: 'linear-gradient(170deg, #4a5770 0%, #3a4658 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.18)' }} />
    </Slab>
    <div style={{ ...flat, left: -LID.w / 2 + 90, top: -BASE_T - LID_T - 2, width: LID.w - 180, height: LID_T + 3, transform: `translateZ(${-LID_T}px)`, borderRadius: 4, background: '#1c222b' }} />
    <div style={{ ...flat, left: -LID.w / 2, top: -BASE_T - LID_T / 2 - 1 - LID.h, width: LID.w, height: LID.h, transformOrigin: '50% 100%', transform: `translateZ(${-LID_T / 2}px) rotateX(${lid}deg)` }}>
      <Slab
        w={NOTCH.w}
        h={NOTCH.h * 2}
        t={LID_T}
        r={NOTCH.h - 1}
        wall={bodyWall}
        back={{ background: bodyFace }}
        front={{ background: '#07080a' }}
        style={{ left: (LID.w - NOTCH.w) / 2, top: -NOTCH.h }}
      >
        <div style={{ position: 'absolute', left: '50%', top: 6, width: 7, height: 7, marginLeft: -3.5, borderRadius: '50%', background: '#1b2a3d', boxShadow: '0 0 0 2px #0e1116' }} />
      </Slab>
      <Slab w={LID.w} h={LID.h} t={LID_T} r={BODY.r - 12} wall={bodyWall} back={{ background: bodyFace, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} front={{ background: '#07080a', boxShadow: 'inset 0 0 0 2px #1d232c' }}>
        <div style={{ position: 'absolute', left: BEZEL.side, top: BEZEL.top, width: SCREEN.w, height: SCREEN.h, overflow: 'hidden', borderRadius: 10, background: '#0a0f1a' }}>
          <Footage src={TAKE.laptop.src} segments={segmentsFor(TAKE.laptop.start)} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)' }} />
        </div>
      </Slab>
    </div>
  </div>
);

const Phone: React.FC<{ on: number; frame: number }> = ({ on, frame }) => {
  const t = (frame - F.tap) / (0.45 * FPS);
  return (
    <div style={{ ...flat, left: '50%', top: '50%', transform: `translate3d(${PHONE_X}px, ${FLOOR_Y}px, 120px)` }}>
      <div style={{ ...flat, left: -PHONE.w / 2 - 30, top: -60, width: PHONE.w + 60, height: 200, transformOrigin: '50% 60px', transform: 'rotateX(90deg)', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 70%)', filter: 'blur(18px)' }} />
      <div style={{ ...flat, left: -PHONE.w / 2, top: -PHONE.h, width: PHONE.w, height: PHONE.h, transformOrigin: '50% 100%', transform: 'rotateY(-16deg) rotateX(7deg)' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: PHONE.r, background: '#07080a', boxShadow: 'inset 0 0 0 2px #3a3f48, 0 0 0 4px #23262c, 0 0 0 5px #4a4f58' }}>
          <div style={{ position: 'absolute', left: PHONE_BEZEL, top: PHONE_BEZEL, width: PHONE_SCREEN.w, height: PHONE_SCREEN.h, overflow: 'hidden', borderRadius: PHONE.r - PHONE_BEZEL, background: '#000' }}>
            <div style={{ width: TAKE.phone.w, transform: `scale(${PHONE_SCALE})`, transformOrigin: '0 0' }}>
              <div style={{ height: SAFE.top, background: '#131c2c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 34px 0', boxSizing: 'border-box', fontFamily: SANS, fontWeight: 600, fontSize: 17, color: C.text }}>
                <span>9:41</span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 16, height: 11, borderRadius: 2, background: C.text, clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
                  <span style={{ width: 24, height: 12, borderRadius: 3, border: `1.5px solid ${C.text}`, padding: 1.5, boxSizing: 'border-box' }}>
                    <span style={{ display: 'block', width: '70%', height: '100%', borderRadius: 1, background: C.text }} />
                  </span>
                </span>
              </div>
              <div style={{ position: 'relative', height: TAKE.phone.h }}>
                <Footage src={TAKE.phone.src} segments={segmentsFor(TAKE.phone.start)} />
                {t >= 0 && t <= 1 && (
                  <div style={{ position: 'absolute', left: TAP.x, top: TAP.y, width: 32 + 68 * t, height: 32 + 68 * t, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `rgba(255,255,255,${0.35 * (1 - t)})` }} />
                )}
              </div>
              <div style={{ height: SAFE.bottom, background: '#161f30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 130, height: 5, borderRadius: 3, background: 'rgba(244,245,248,0.75)' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 1 - on }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)' }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: PHONE_BEZEL + 14, width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: '#000', boxShadow: '0 0 0 2px #111' }} />
        </div>
        <div style={{ position: 'absolute', right: -7, top: 170, width: 5, height: 90, borderRadius: 3, background: '#3a3f48' }} />
        <div style={{ position: 'absolute', right: -7, top: 290, width: 5, height: 56, borderRadius: 3, background: '#3a3f48' }} />
      </div>
    </div>
  );
};

type Cam = { x: number; y: number; s: number; rx: number; ry: number };
const CAM: [number, Cam][] = [
  [0, { x: 230, y: -10, s: 0.74, rx: -9, ry: 9 }],
  [F.lidClose, { x: 215, y: -20, s: 0.71, rx: -10, ry: 8 }],
  [F.lidClose + sec(1.4), { x: -100, y: -60, s: 0.58, rx: -13, ry: 2 }],
  [F.wake - sec(0.2), { x: -105, y: -60, s: 0.59, rx: -13, ry: 1 }],
  [F.wake + sec(1.1), { x: -700, y: 45, s: 1.2, rx: -5, ry: -8 }],
  [F.lidOpen, { x: -715, y: 45, s: 1.23, rx: -5, ry: -9 }],
  [F.lidOpen + sec(1.3), { x: -110, y: -50, s: 0.6, rx: -9, ry: 3 }],
  [DEVICE_SYNC_FRAMES, { x: -110, y: -50, s: 0.62, rx: -9, ry: 1 }],
];

const camAt = (frame: number): Cam => {
  const i = Math.max(0, CAM.findIndex(([f], j) => frame >= f && frame < (CAM[j + 1]?.[0] ?? Infinity)));
  const [f0, a] = CAM[i];
  const [f1, b] = CAM[Math.min(i + 1, CAM.length - 1)];
  const k = f1 === f0 ? 1 : Easing.inOut(Easing.cubic)(Math.min(1, (frame - f0) / (f1 - f0)));
  const mix = (key: keyof Cam) => a[key] + (b[key] - a[key]) * k;
  return { x: mix('x'), y: mix('y'), s: mix('s'), rx: mix('rx'), ry: mix('ry') };
};

const CAPTIONS: { from: number; to: number; text: React.ReactNode }[] = [
  { from: sec(0.3), to: F.lidClose + sec(0.4), text: 'Start a deploy on your laptop.' },
  { from: F.lidClose + sec(0.6), to: F.wake, text: <>Close the lid. <span style={{ color: C.cyan }}>It keeps running.</span></> },
  { from: F.wake + sec(0.3), to: F.lidOpen - sec(0.2), text: 'Pick it up on your phone.' },
  { from: F.lidOpen + sec(0.3), to: DEVICE_SYNC_FRAMES, text: <>One session. <span style={{ color: C.cyan }}>Live on both.</span></> },
];

const Caption: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const c = CAPTIONS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const inP = spring({ frame: frame - c.from, fps, config: { damping: 200 }, durationInFrames: 14 });
  const outP = interpolate(frame, [c.to - 8, c.to], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const last = c === CAPTIONS[CAPTIONS.length - 1];
  return (
    <div style={{ opacity: inP * (last ? 1 : outP), transform: `translateY(${(1 - inP) * 16}px)`, fontFamily: SANS, fontWeight: 700, fontSize: 60, color: C.text, letterSpacing: -1.4 }}>
      {c.text}
    </div>
  );
};

export const DeviceSync: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const smooth = (from: number, durationInFrames: number) => spring({ frame: frame - from, fps, durationInFrames, config: { damping: 200 } });
  const lid = 12 - 102 * (smooth(F.lidClose, sec(0.8)) - smooth(F.lidOpen, sec(0.8)));
  const phoneOn = smooth(F.wake, sec(0.35));
  const cam = camAt(frame);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ perspective: 4200, perspectiveOrigin: '50% 40%' }}>
        <div style={{ ...flat, inset: 0, transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)` }}>
          <Laptop lid={lid} />
          <Phone on={phoneOn} frame={frame} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: '96px 0 0 120px' }}>
        <Caption frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 0 64px 120px' }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted, opacity: interpolate(frame, [F.lidOpen + sec(0.8), F.lidOpen + sec(1.3)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          cross-device sessions · end-to-end encrypted sync
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
