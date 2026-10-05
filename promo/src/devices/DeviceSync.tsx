import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { Footage, Segment } from '../components/AppWindow';
import { C, FPS, MONO, SANS, sec } from '../theme';
import { HandoffScene, TapRipple, handoffCaptions, handoffPose, type HandoffKeys } from '../../../shared/devices/handoff';
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

const KEYS: HandoffKeys = {
  duration: DEVICE_SYNC_FRAMES / FPS,
  lidClose: F.lidClose / FPS,
  wake: F.wake / FPS,
  tap: F.tap / FPS,
  lidOpen: F.lidOpen / FPS,
};

const CAPTIONS = handoffCaptions(KEYS).map((c) => ({
  from: sec(c.from),
  to: sec(c.to),
  text: c.accent ? <>{c.text} <span style={{ color: C.cyan }}>{c.accent}</span></> : c.text,
}));

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
  const t = frame / FPS;
  const { lidOpen } = F;

  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Background />
      <HandoffScene
        t={t}
        keys={KEYS}
        laptopAspect={TAKE.laptop.h / TAKE.laptop.w}
        phoneApp={{ w: TAKE.phone.w, h: TAKE.phone.h }}
        laptopScreen={<Footage src={TAKE.laptop.src} segments={segmentsFor(TAKE.laptop.start)} />}
        phoneScreen={
          <>
            <Footage src={TAKE.phone.src} segments={segmentsFor(TAKE.phone.start)} />
            <TapRipple t={handoffPose(t, KEYS).tap} x={TAP.x} y={TAP.y} />
          </>
        }
      />
      <AbsoluteFill style={{ padding: '96px 0 0 120px' }}>
        <Caption frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 0 64px 120px' }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted, opacity: interpolate(frame, [lidOpen + sec(0.8), lidOpen + sec(1.3)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          cross-device sessions · end-to-end encrypted sync
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
