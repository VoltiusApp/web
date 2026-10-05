import React from 'react';
import { asTake, cutters, timeline } from '../components/take';
import { accented } from '../components/Caption';
import { clipFrames, FootageClip, shots } from './FootageClip';
import cold1 from './takes/cold1.json';
import cold2 from './takes/cold2.json';

const { WIDE, focus } = shots('laptop');

const TAKES = { a: asTake(cold1), b: asTake(cold2) };
const { seg, fit } = cutters(TAKES);
const TL = timeline(
  TAKES,
  [
    seg('a', ['choose', -1.2], ['started', 1.0]),
    seg('b', ['vault', -0.4], ['host', 0], 1.3),
    seg('b', ['host', 0], ['saved', 0.3], 2.2),
    seg('b', ['saved', 0.3], ['connect', 0.2], 1.4),
    fit('b', ['connect', 0.2], ['shell', 0], 1.2),
    seg('b', ['shell', 0], ['end', -1.2]),
  ],
  [['a', 'b']],
);
const at = TL.at;

export const FIRST_RUN_FRAMES = clipFrames(TL);

export const FirstRun: React.FC = () => (
  <FootageClip
    device="laptop"
    tl={TL}
    cams={[
      [0, focus(640, 470, 1.45)],
      [at('a', 'started', 0.3), focus(640, 470, 1.45)],
      [at('b', 'vault', -0.2), WIDE],
      [at('b', 'host', -0.6), focus(1110, 520, 1.5, { dx: 120 })],
      [at('b', 'saved', 0.1), focus(1110, 520, 1.5, { dx: 120 })],
      [at('b', 'connect', 0), WIDE],
      [at('b', 'shell', 0.6), focus(330, 360, 1.45, { dx: -40 })],
      [TL.frames, focus(330, 370, 1.5, { dx: -40 })],
    ]}
    cues={[
      { from: 6, to: at('b', 'vault', -0.4), text: accented('No account?', 'No problem.') },
      { from: at('b', 'vault', -0.2), to: at('b', 'connect', 0), text: 'Add a host.' },
      { from: at('b', 'connect', 0.1), to: at('b', 'shell', 1.5), text: 'Connect.' },
      { from: at('b', 'shell', 1.6), to: TL.frames, text: accented('Signing up stays', 'optional.') },
    ]}
  />
);
