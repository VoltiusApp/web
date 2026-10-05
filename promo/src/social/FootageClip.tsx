import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Background } from '../components/Background';
import { Caption, type CaptionCue } from '../components/Caption';
import { TakeCursor, TakeFootage } from '../components/TakeFootage';
import type { Timeline } from '../components/take';
import { EndCard } from '../scenes/EndCard';
import { C, MONO, SANS, sec } from '../theme';
import { flat, Laptop, SCREEN_W } from '../../../shared/devices/Laptop';
import { Stage, type Cam } from '../../../shared/devices/Stage';
import { keyframes } from '../../../shared/devices/motion';

export type Device = 'laptop' | 'window';

// Shots take points in a 1280×800 frame of the screen, whatever size the take was recorded at.
const REC = { w: 1280, h: 800 };
const LAPTOP = { x: 0, y: 330 };
const LID_H = SCREEN_W * (REC.h / REC.w) + 44;
const TILT = Math.cos((12 * Math.PI) / 180);
const WINDOW = { w: 1500, h: 1500 * (REC.h / REC.w), y: 70 };

const DEVICES: Record<Device, { wide: Cam; rx: number; ry: number; at: (u: number, v: number) => [number, number] }> = {
  laptop: {
    wide: { x: -330, y: -60, s: 0.76, rx: -11, ry: -9 },
    rx: -5,
    ry: -4,
    at: (u, v) => [LAPTOP.x - SCREEN_W / 2 + (u * SCREEN_W) / REC.w, LAPTOP.y - 25.5 - (LID_H - 18 - (v * SCREEN_W) / REC.w) * TILT],
  },
  window: {
    wide: { x: 0, y: -10, s: 0.84, rx: 9, ry: -11 },
    rx: 2,
    ry: -3,
    at: (u, v) => [-WINDOW.w / 2 + (u * WINDOW.w) / REC.w, WINDOW.y - WINDOW.h / 2 + (v * WINDOW.h) / REC.h],
  },
};

/** WIDE, and focus(): the camera that puts screen point (u, v) at frame offset (dx, dy) from the centre, at scale s. */
export const shots = (device: Device) => {
  const d = DEVICES[device];
  const focus = (u: number, v: number, s: number, o: Partial<Cam> & { dx?: number; dy?: number } = {}): Cam => {
    const [X, Y] = d.at(u, v);
    return { x: (o.dx ?? 0) - s * X, y: (o.dy ?? 60) - s * Y, s, rx: o.rx ?? d.rx, ry: o.ry ?? d.ry };
  };
  return { WIDE: d.wide, focus };
};

export const END_FRAMES = sec(2.6);
const END_FADE = 12;

export type CamKey = [number, Cam];

export const clipFrames = (tl: Timeline) => tl.frames + END_FRAMES - END_FADE;

/** Background, captions, footer, then the end card over the last END_FADE frames of a `frames`-long scene. */
export const ClipFrame: React.FC<{ frames: number; cues: CaptionCue[]; headline?: string; footer?: string; children: React.ReactNode }> = ({ frames, cues, headline, footer, children }) => {
  const frame = useCurrentFrame();
  const endAt = frames - END_FADE;
  const fadeOut = interpolate(frame, [endAt, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Background />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {children}
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 300, background: 'linear-gradient(180deg, rgba(5,6,10,0.85) 0%, rgba(5,6,10,0.55) 50%, rgba(5,6,10,0) 100%)' }} />
        <AbsoluteFill style={{ padding: '80px 0 0 110px' }}>
          <Caption cues={cues} frame={frame} />
        </AbsoluteFill>
        {footer && <div style={{ position: 'absolute', left: 112, top: 168, fontFamily: MONO, fontSize: 21, color: C.muted }}>{footer}</div>}
      </AbsoluteFill>
      <Sequence from={endAt}>
        <EndCard headline={headline} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Screen: React.FC<{ tl: Timeline; frame: number; width: number }> = ({ tl, frame, width }) => {
  const take = tl.takes[tl.segs[0].take];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: take.w, height: take.h, transform: `scale(${width / take.w})`, transformOrigin: '0 0' }}>
      <TakeFootage tl={tl} />
      <TakeCursor tl={tl} frame={frame} />
    </div>
  );
};

const AppWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ ...flat, left: `calc(50% - ${WINDOW.w / 2}px)`, top: `calc(50% + ${WINDOW.y - WINDOW.h / 2}px)`, width: WINDOW.w, height: WINDOW.h }}>
    <div style={{ position: 'absolute', inset: -70, borderRadius: 80, background: 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.18), transparent 70%)', filter: 'blur(30px)' }} />
    <div style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: '#0b0f17', boxShadow: '0 60px 160px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.10)' }}>{children}</div>
  </div>
);

/** Recorded footage on a laptop or as a floating app window, with a camera moving between shots. */
export const FootageClip: React.FC<{ device: Device; tl: Timeline; cams: CamKey[]; cues: CaptionCue[]; headline?: string; footer?: string }> = ({ device, tl, cams, ...chrome }) => {
  const frame = useCurrentFrame();
  return (
    <ClipFrame frames={tl.frames} {...chrome}>
      <Stage cam={keyframes(frame, cams)}>
        {device === 'laptop' ? (
          <Laptop lid={12} x={LAPTOP.x} y={LAPTOP.y} aspect={REC.h / REC.w} screen={<Screen tl={tl} frame={frame} width={SCREEN_W} />} />
        ) : (
          <AppWindow>
            <Screen tl={tl} frame={frame} width={WINDOW.w} />
          </AppWindow>
        )}
      </Stage>
    </ClipFrame>
  );
};
