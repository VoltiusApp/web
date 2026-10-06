import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { asTake, cutters, timeline } from '../components/take';
import { accented, type CaptionCue } from '../components/Caption';
import { C, MONO, SANS } from '../theme';
import { clipFrames, FootageClip, hold, shots } from './FootageClip';
import h2h from './takes/hosttohost.json';

const { WIDE, focus } = shots('window');

const TAKES = { a: asTake(h2h) };
const { seg, fit } = cutters(TAKES);
const TL = timeline(TAKES, [
  seg('a', ['drag', -0.8], ['dropped', 0.6], 1.3),
  fit('a', ['dropped', 0.6], ['done', 0], 3.2),
  seg('a', ['done', 0], ['end', 0]),
]);
const at = (m: string, d = 0) => TL.at('a', m, d);
const QUEUE = focus(1105, 770, 1.7, { dy: 90 });

export const HOST_TO_HOST_FRAMES = clipFrames(TL);

const Node: React.FC<{ name: string; sub: string; accent?: boolean }> = ({ name, sub, accent }) => (
  <div style={{ padding: '18px 26px', borderRadius: 18, background: C.card, border: `1px solid ${accent ? C.cyan : C.line}`, textAlign: 'center', minWidth: 210 }}>
    <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 700, color: C.text }}>{name}</div>
    <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted, marginTop: 4 }}>{sub}</div>
  </div>
);

const Link: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'relative', width: 170, height: 4, borderRadius: 2, background: C.line }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: 'absolute', top: -4, left: `${(((t / 30 + i / 3) % 1) * 100).toFixed(2)}%`, width: 12, height: 12, borderRadius: 6, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}` }} />
    ))}
    <div style={{ position: 'absolute', top: 14, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 18, color: C.muted }}>SSH</div>
  </div>
);

/** The route a host-to-host copy takes: tar on one host, through Voltius in memory, untar on the other. */
const Route: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at('dropped', 0.8), at('dropped', 0.8) + 12, at('done', 0) - 6, at('done', 0) + 6], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o === 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: o }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Node name="web-01" sub="tar -c" />
        <Link t={frame} />
        <Node name="Voltius" sub="streams in memory" accent />
        <Link t={frame} />
        <Node name="web-02" sub="tar -x" />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted }}>no temp archive on either host · nothing saved on your laptop</div>
    </div>
  );
};

const CUES: Record<'plain' | 'route', CaptionCue[]> = {
  plain: [
    { from: 4, to: at('dropped', 0.6), text: accented('web-01', 'to web-02.') },
    { from: at('dropped', 0.7), to: at('done', 0), text: accented('It streams across', 'as tar over SSH.') },
    { from: at('done', 0.1), to: TL.frames, text: accented('Nothing saved', 'on your laptop.') },
  ],
  route: [
    { from: 4, to: at('dropped', 0.6), text: accented('A big folder.', 'A tiny /tmp?') },
    { from: at('dropped', 0.7), to: at('done', 0), text: accented('No temp archive.', 'It streams.') },
    { from: at('done', 0.1), to: TL.frames, text: accented('Done.', 'Host to host.') },
  ],
};

export const HostToHost: React.FC<{ route: boolean }> = ({ route }) => (
  <FootageClip
    device="window"
    tl={TL}
    cams={[
      [0, WIDE],
      [at('drag', 0.2), focus(640, 400, 0.88)],
      ...hold(at('dropped', 0.8), at('done', 0), route ? focus(640, 330, 0.78, { dy: -40 }) : QUEUE),
      [at('done', 0.8), focus(950, 300, 1.05, { dx: -60 })],
      [TL.frames, focus(950, 300, 1.09, { dx: -60 })],
    ]}
    cues={CUES[route ? 'route' : 'plain']}
    overlay={route ? <Route /> : undefined}
    footer="SFTP · host to host · tar streaming"
  />
);
