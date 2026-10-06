import React from 'react';
import { asTake, cutters, timeline } from '../components/take';
import { accented } from '../components/Caption';
import { clipFrames, drift, FootageClip, hold, shots } from './FootageClip';
import kill from './takes/kill.json';

const { WIDE, focus } = shots('laptop');

const TAKES = { a: asTake(kill) };
const { seg } = cutters(TAKES);
// Between killed and window the relaunched window is still unsized; the cut skips it.
const TL = timeline(TAKES, [
  seg('a', ['kill', -4.2], ['kill', 0]),
  seg('a', ['killed', 0], ['killed', 1.3]),
  seg('a', ['window', 0], ['restored', 0], 1.5),
  seg('a', ['restored', 0], ['end', 0]),
]);
const at = (m: string, d = 0) => TL.at('a', m, d);
const BUILD = focus(330, 250, 1.45, { dx: -60 });

export const KILL_RESTORE_FRAMES = clipFrames(TL);

export const KillRestore: React.FC = () => (
  <FootageClip
    device="laptop"
    tl={TL}
    cams={[
      [0, BUILD],
      ...hold(at('kill', -1.2), at('restored', 1.2), WIDE),
      [at('restored', 3.2), BUILD],
      [TL.frames, drift(BUILD)],
    ]}
    cues={[
      { from: 4, to: at('kill', -0.4), text: 'A build is running.' },
      { from: at('kill', -0.3), to: at('window', 0), text: accented('Force-quit', 'Voltius.') },
      { from: at('window', 0.1), to: at('restored', 1.7), text: 'Reopen it.' },
      { from: at('restored', 1.8), to: TL.frames, text: accented('Splits, scrollback,', 'the build. Still there.') },
    ]}
    footer="persistent sessions · tmux on the host · workspace restore"
  />
);
