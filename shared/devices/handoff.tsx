import React from 'react';
import { Laptop } from './Laptop';
import { Phone } from './Phone';
import { Stage, type Cam } from './Stage';
import { keyframes, settle } from './motion';

/** Moments of the laptop → phone handoff, in seconds of a timeline `duration` long. */
export type HandoffKeys = { duration: number; lidClose: number; wake: number; tap: number; lidOpen: number };

export const HANDOFF_KEYS: HandoffKeys = { duration: 18, lidClose: 2.5, wake: 5.5, tap: 6.6, lidOpen: 12.5 };

export const handoffCaptions = (k: HandoffKeys) => [
  { from: 0.3, to: k.lidClose + 0.4, text: 'Start a deploy on your laptop.' },
  { from: k.lidClose + 0.6, to: k.wake, text: 'Close the lid.', accent: 'It keeps running.' },
  { from: k.wake + 0.3, to: k.lidOpen - 0.2, text: 'Pick it up on your phone.' },
  { from: k.lidOpen + 0.3, to: k.duration, text: 'One session.', accent: 'Live on both.' },
];

const camKeys = (k: HandoffKeys): [number, Cam][] => [
  [0, { x: 230, y: -10, s: 0.74, rx: -9, ry: 9 }],
  [k.lidClose, { x: 215, y: -20, s: 0.71, rx: -10, ry: 8 }],
  [k.lidClose + 1.4, { x: -100, y: -60, s: 0.58, rx: -13, ry: 2 }],
  [k.wake - 0.2, { x: -105, y: -60, s: 0.59, rx: -13, ry: 1 }],
  [k.wake + 1.1, { x: -700, y: 45, s: 1.2, rx: -5, ry: -8 }],
  [k.lidOpen, { x: -715, y: 45, s: 1.23, rx: -5, ry: -9 }],
  [k.lidOpen + 1.3, { x: -110, y: -50, s: 0.6, rx: -9, ry: 3 }],
  [k.duration, { x: -110, y: -50, s: 0.62, rx: -9, ry: 1 }],
];

export const handoffPose = (t: number, k: HandoffKeys) => ({
  lid: 12 - 102 * (settle(t - k.lidClose, 0.8) - settle(t - k.lidOpen, 0.8)),
  phoneOn: settle(t - k.wake, 0.35),
  tap: (t - k.tap) / 0.45,
  cam: keyframes(t, camKeys(k)),
});

export const TapRipple: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) =>
  t >= 0 && t <= 1 ? (
    <div style={{ position: 'absolute', left: x, top: y, width: 32 + 68 * t, height: 32 + 68 * t, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `rgba(255,255,255,${0.35 * (1 - t)})` }} />
  ) : null;

export const HandoffScene: React.FC<{
  t: number;
  keys?: HandoffKeys;
  laptopScreen: React.ReactNode;
  phoneScreen: React.ReactNode;
  laptopAspect?: number;
  phoneApp?: { w: number; h: number };
}> = ({ t, keys = HANDOFF_KEYS, laptopScreen, phoneScreen, laptopAspect, phoneApp }) => {
  const pose = handoffPose(t, keys);
  return (
    <Stage cam={pose.cam}>
      <Laptop lid={pose.lid} x={-300} y={330} aspect={laptopAspect} screen={laptopScreen} />
      <Phone on={pose.phoneOn} x={640} y={330} z={120} appW={phoneApp?.w} appH={phoneApp?.h} screen={phoneScreen} />
    </Stage>
  );
};
