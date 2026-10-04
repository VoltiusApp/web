import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SANS, MONO } from '../theme';
import { cursorAt, DFPS, FOOTAGE_FRAMES, frameOf, mk, SEG_STARTS, SEGS, segFrames, sourceAt, Src } from './timeline';

export const DW = 1600;
export const DH = 900;
const SW = 1280;
const SH = 800;
const K = 0.95;
const WIN_TOP = 34;
const END = 54;
export const DEMO_FRAMES = FOOTAGE_FRAMES + END;

// Each move starts at a source moment and glides to its target over RAMP output frames.
// Targets are clamped in Stage so the window never pans past its own edges; y=0 keeps the title bar in view.
type View = { s: number; x: number; y: number };
const REST: View = { s: 1, x: 640, y: 400 };
const RAMP = 40;
const MOVES: [Src, number, View][] = [
  ['A', mk('A', 'import-open', -0.2), { s: 1.5, x: 1000, y: 300 }],
  ['A', mk('A', 'termius', 0.3), { s: 1.15, x: 640, y: 400 }],
  ['A', mk('A', 'imported', 0.5), REST],
  ['A', mk('A', 'type', -0.7), { s: 1.4, x: 0, y: 0 }],
  ['A', mk('A', 'panel', -0.1), { s: 1.3, x: 1280, y: 0 }],
  ['A', mk('A', 'light', -0.4), REST],
  ['A', mk('A', 'palette', 0.1), { s: 1.35, x: 640, y: 300 }],
  ['A', mk('A', 'newtab', 0.5), REST],
  ['B', mk('B', 'drag', -0.8), { s: 1.15, x: 620, y: 360 }],
  ['B', mk('B', 'landed', 0.8), REST],
];
const MOVES_F = MOVES.map(([src, t, v]) => ({ f: frameOf(src, t), v }));

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const mix = (a: View, b: View, k: number): View => ({ s: a.s + (b.s - a.s) * k, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
function camAt(frame: number): View {
  let cur = REST;
  for (const m of MOVES_F) {
    if (frame < m.f) break;
    cur = mix(cur, m.v, ease(Math.min(1, (frame - m.f) / RAMP)));
  }
  return cur;
}

type Cap = [Src, number, Src, number, string];
const CAPTIONS: Cap[] = [
  ['A', mk('A', 'import-open', -1.2), 'A', mk('A', 'grid', 1.0), 'Import your hosts from Termius, PuTTY, SecureCRT…'],
  ['A', mk('A', 'connect', -0.2), 'A', mk('A', 'panel', -0.2), 'Connect in one click'],
  ['A', mk('A', 'panel', 0.1), 'A', mk('A', 'themes', -0.1), 'Docker containers right next to your shell'],
  ['A', mk('A', 'themes', 0.0), 'A', mk('A', 'palette', -0.3), 'Switch themes instantly'],
  ['A', mk('A', 'palette', 0.0), 'A', mk('A', 'split', -0.2), 'Ctrl+K to open any host'],
  ['A', mk('A', 'split', 0.0), 'A', mk('A', 'end', -0.8), 'Drag a tab to split the view'],
  ['B', mk('B', 'sftp', -0.25), 'B', mk('B', 'end', -1.1), 'Drag & drop files over SFTP'],
];

const Background: React.FC<{ dim?: number }> = ({ dim = 0 }) => (
  <AbsoluteFill style={{ background: '#0d1517' }}>
    <Img src={staticFile('demo/wallpaper.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    {dim > 0 && <AbsoluteFill style={{ background: `rgba(5,10,12,${dim})` }} />}
  </AbsoluteFill>
);

const Footage: React.FC = () => (
  <>
    {SEGS.map((s, i) => (
      <Sequence key={i} from={SEG_STARTS[i]} durationInFrames={segFrames(s)} layout="none">
        <OffthreadVideo src={staticFile(`demo/${s.src}.mp4`)} trimBefore={Math.round(s.from * DFPS)} playbackRate={s.rate} muted style={{ position: 'absolute', inset: 0, width: SW, height: SH }} />
      </Sequence>
    ))}
  </>
);

const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  const { src, t } = sourceAt(Math.min(frame, FOOTAGE_FRAMES - 1));
  const c = cursorAt(src, t);
  const since = t - c.lastDown;
  const ring = since >= 0 && since < 0.45 ? since / 0.45 : -1;
  return (
    <>
      {ring >= 0 && (
        <div style={{ position: 'absolute', left: c.x - 22, top: c.y - 22, width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(87,199,216,0.9)', transform: `scale(${0.3 + ring * 0.9})`, opacity: 1 - ring }} />
      )}
      <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: 'absolute', left: c.x - 4, top: c.y - 2, transform: `scale(${c.pressed ? 0.88 : 1})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))' }}>
        <path d="M4 2 L4 19 L8.5 14.8 L11.6 21.6 L14.4 20.4 L11.4 13.7 L17.6 13.4 Z" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </>
  );
};

const Stage: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = camAt(frame);
  const s = cam.s;
  const cx = s > 1 ? Math.min(Math.max(cam.x, SW / 2 / s), SW - SW / 2 / s) : cam.x;
  const cy = s > 1 ? Math.min(Math.max(cam.y, SH / 2 / s), SH - SH / 2 / s) : cam.y;
  const restX = (DW - SW * K) / 2;
  const scale = K * s;
  const left = restX + (SW / 2) * K - cx * scale;
  const top = WIN_TOP + (SH / 2) * K - cy * scale;
  return (
    <div style={{ position: 'absolute', left, top, width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', background: '#0b0f17' }}>
        <Footage />
        <Cursor frame={frame} />
      </div>
    </div>
  );
};

const Caption: React.FC<{ frame: number }> = ({ frame }) => {
  for (const [sa, ta, sb, tb, text] of CAPTIONS) {
    const a = frameOf(sa, ta), b = frameOf(sb, tb);
    if (frame < a || frame > b) continue;
    const o = interpolate(frame, [a, a + 8, b - 8, b], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, background: 'rgba(8,20,24,0.88)', border: '1px solid rgba(87,199,216,0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', fontFamily: SANS, fontSize: 30, fontWeight: 600, color: '#eef7f9', letterSpacing: '-0.01em' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#57c7d8', boxShadow: '0 0 12px #57c7d8' }} />
          {text}
        </div>
      </div>
    );
  }
  return null;
};

const EndCard: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - FOOTAGE_FRAMES;
  const o = interpolate(f, [-10, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0) return null;
  const out = interpolate(f, [END - 10, END], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: 'center', justifyContent: 'center' }}>
      <Background dim={0.45} />
      <div style={{ position: 'relative', opacity: out, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Img src={staticFile('logo.png')} style={{ width: 110, height: 110 }} />
          <div style={{ fontFamily: SANS, fontSize: 104, fontWeight: 800, letterSpacing: '-0.05em', color: '#f4f8f9' }}>Voltius</div>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 500, color: '#b9cfd3', marginTop: 26 }}>Free · Open source · No account required</div>
        <div style={{ fontFamily: MONO, fontSize: 42, fontWeight: 600, color: '#57c7d8', marginTop: 30 }}>voltius.app</div>
      </div>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Stage frame={frame} />
        <Caption frame={frame} />
      </AbsoluteFill>
      <EndCard frame={frame} />
    </AbsoluteFill>
  );
};
