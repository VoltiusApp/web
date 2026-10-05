import React from 'react';
import { asTake, cutters, timeline, type Seg } from '../components/take';
import { accented } from '../components/Caption';
import { clipFrames, FootageClip, shots } from './FootageClip';
import themes from './takes/themes.json';

const { focus } = shots('window');

const NAMES = ['Dracula', 'Nord', 'Monokai', 'Tokyo Night', 'Voltius Light', 'Voltius'];
const BEAT = 0.85;
// The pointer takes ~0.6 s to reach a theme and click it; cut once it has landed.
const LAND = 0.75;
const TAKES = { a: asTake(themes) };
const { seg, fit } = cutters(TAKES);
const mark = (i: number) => `theme${i}`;
// One beat per theme, cut just after each click lands.
const TL = timeline(TAKES, [
  seg('a', ['theme0', -1.2], ['theme0', LAND], 1.2),
  ...NAMES.slice(0, -1).map((_, i): Seg => fit('a', [mark(i), LAND], [mark(i + 1), LAND], BEAT)),
  seg('a', ['theme5', LAND], ['end', 0]),
]);
const at = (i: number) => TL.at('a', mark(i), LAND);
const cam = (i: number) => focus(470, 330, 0.95 + 0.015 * i, { dx: -140, ry: i % 2 ? -5 : 1 });

export const THEME_SPEEDRUN_FRAMES = clipFrames(TL);

export const ThemeSpeedrun: React.FC = () => (
  <FootageClip
    device="window"
    tl={TL}
    cams={[[0, cam(0)], ...NAMES.map((_, i): [number, ReturnType<typeof cam>] => [at(i), cam(i + 1)]), [TL.frames, cam(NAMES.length + 1)]]}
    cues={[
      { from: 4, to: at(0), text: 'Six built-in themes.' },
      ...NAMES.map((n, i) => ({ from: at(i), to: i === NAMES.length - 1 ? at(i) + 20 : at(i + 1), text: n })),
      { from: at(NAMES.length - 1) + 20, to: TL.frames, text: accented('One click.', 'Pick yours.') },
    ]}
    footer="or make your own in the theme editor"
  />
);
