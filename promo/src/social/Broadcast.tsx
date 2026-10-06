import React from 'react';
import { asTake, cutters, timeline } from '../components/take';
import { accented } from '../components/Caption';
import { clipFrames, drift, FootageClip, hold, shots } from './FootageClip';
import broadcast from './takes/broadcast.json';

const { WIDE, focus } = shots('window');

const TAKES = { a: asTake(broadcast) };
const { seg, fit } = cutters(TAKES);
const TL = timeline(TAKES, [
  seg('a', ['select', -0.8], ['select', 1.0]),
  fit('a', ['connect', -0.4], ['grid', 0], 1.2),
  seg('a', ['grid', 0], ['broadcast', 1.0], 1.4),
  fit('a', ['type', 0], ['enter', 0.4], 2.2),
  seg('a', ['enter', 0.4], ['enter', 4.4]),
  fit('a', ['enter', 4.4], ['done', 0], 2.2),
  seg('a', ['done', 0], ['end', 0]),
]);
const at = (m: string, d = 0) => TL.at('a', m, d);
const ALL = focus(640, 420, 0.8, { rx: 6, ry: -7 });
const PANES = focus(380, 260, 1.2, { dx: -40 });

export const BROADCAST_FRAMES = clipFrames(TL);

export const Broadcast: React.FC = () => (
  <FootageClip
    device="window"
    tl={TL}
    cams={[
      [0, WIDE],
      [at('connect', 0), ALL],
      ...hold(at('broadcast', 0.2), at('enter', 0.4), PANES),
      [at('enter', 2.8), ALL],
      [TL.frames, drift(ALL)],
    ]}
    cues={[
      { from: 4, to: at('grid', 0), text: 'Twelve servers.' },
      { from: at('grid', 0.1), to: at('type', 0), text: 'Broadcast on.' },
      { from: at('type', 0.1), to: TL.frames, text: accented('Type once.', 'Run on twelve.') },
    ]}
    footer="split panes · broadcast input"
  />
);
