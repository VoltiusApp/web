import React from 'react';
import { useCurrentFrame } from 'remotion';
import { asTake, timeline, type Seg } from '../components/take';
import { accented } from '../components/Caption';
import { C, SANS } from '../theme';
import { ClipFrame, clipFrames, Screen } from './FootageClip';
import hostJson from './takes/pair-host.json';
import guestJson from './takes/pair-guest.json';

// Two instances recorded on one wall clock: the guest's footage is the host's cut, shifted by the gap between their first frames.
const host = asTake(hostJson);
const guest = asTake(guestJson);
const shift = (host.start ?? 0) - (guest.start ?? 0);
const g = (mark: string, d = 0) => guest.marks[mark] - shift + d;
const h = (mark: string, d = 0) => host.marks[mark] + d;

const CUT: [number, number, number][] = [
  [h('share', -1), h('invite', 1.5), 1.6],
  [g('join', -1), g('blocked', 1.6), 1.3],
  [g('request', -0.3), h('grant', 1), 1.8],
  [g('typed', -0.3), g('typed', 3), 1.2],
  [h('revoke', -0.3), g('end'), 1.2],
];
const segs = (take: string, d: number): Seg[] => CUT.map(([from, to, rate]) => ({ take, from: from + d, to: to + d, rate }));
const HOST = timeline({ a: host }, segs('a', 0));
const GUEST = timeline({ a: guest }, segs('a', shift));
const at = (t: number) => HOST.frameOf('a', t);

export const PAIR_CLIP_FRAMES = clipFrames(HOST);

const W = 860;
const Pane: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ width: W }}>
    <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 600, color: C.muted, marginBottom: 14 }}>{label}</div>
    <div style={{ position: 'relative', width: W, height: (W * 800) / 1280, borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}>{children}</div>
  </div>
);

export const PairClip: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <ClipFrame
      frames={HOST.frames}
      footer="shared terminals · control handoff"
      cues={[
        { from: 4, to: at(g('join', -1)), text: accented('Share a live', 'terminal.') },
        { from: at(g('join', -1)), to: at(g('request', -0.3)), text: accented('No control?', 'Keys go nowhere.') },
        { from: at(g('request', -0.3)), to: at(g('typed', -0.3)), text: 'Hand over control.' },
        { from: at(g('typed', -0.3)), to: at(h('revoke', -0.3)), text: accented('They type,', 'you both see it.') },
        { from: at(h('revoke', -0.3)), to: HOST.frames, text: 'Take it back.' },
      ]}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 60 }}>
        <Pane label="You · sharing web-01">
          <Screen tl={HOST} frame={frame} width={W} />
        </Pane>
        <Pane label="Teammate · joined">
          <Screen tl={GUEST} frame={frame} width={W} />
        </Pane>
      </div>
    </ClipFrame>
  );
};
