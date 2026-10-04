import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Background } from './components/Background';
import { footageFrames, Segment, Zoom } from './components/AppWindow';
import { words } from './components/Kinetic';
import { FeatureScene } from './scenes/FeatureScene';
import { Intro, INTRO_FRAMES } from './scenes/Intro';
import { Privacy } from './scenes/Privacy';
import { Wall } from './scenes/Wall';
import { EndCard, Stats } from './scenes/EndCard';
import { sec } from './theme';

const T = 12;

type Feature = { eyebrow: string; title: ReturnType<typeof words>; src: string; segments: Segment[]; zooms?: Zoom[]; tail?: number };

export const FEATURES: Record<string, Feature> = {
  palette: {
    eyebrow: 'Command palette',
    title: words('Every host.', 'One keystroke.'),
    src: 'footage/A_palette.mp4',
    segments: [{ from: 2.3, to: 6.4, rate: 1.5 }, { from: 6.4, to: 9.4, rate: 3 }, { from: 10.6, to: 13.8 }],
    zooms: [{ start: 14, end: 100, scale: 1.18, x: 720, y: 360 }],
  },
  split: {
    eyebrow: 'Split panes + broadcast',
    title: words('Type once.', 'Run everywhere.'),
    src: 'footage/B_split.mp4',
    segments: [{ from: 5.4, to: 10.4, rate: 3 }, { from: 11.6, to: 16.6, rate: 1.2 }],
  },
  themes: {
    eyebrow: 'Themes',
    title: words('Make it', 'yours.'),
    src: 'footage/B_split.mp4',
    segments: [{ from: 16.9, to: 25.9, rate: 1.7 }],
  },
  sftp: {
    eyebrow: 'Dual-pane SFTP',
    title: words('Files, everywhere.', 'Side by side.'),
    src: 'footage/C_sftp.mp4',
    segments: [{ from: 3.4, to: 13.4, rate: 2.2 }, { from: 13.4, to: 36.3, rate: 11 }, { from: 36.3, to: 38.6 }],
    
  },
  import: {
    eyebrow: 'Import',
    title: words('Bring your hosts.', 'One click.'),
    src: 'footage/D_import.mp4',
    segments: [{ from: 1.4, to: 10.6, rate: 1.7 }, { from: 10.6, to: 21.5, rate: 9 }, { from: 22.5, to: 25.6 }],
    zooms: [{ start: 14, end: 150, scale: 1.15, x: 720, y: 420 }],
  },
};

const featureFrames = (f: Feature) => footageFrames(f.segments) + 14;

const SCENES: { el: React.ReactNode; frames: number }[] = [
  { el: <Intro />, frames: INTRO_FRAMES },
  ...['palette', 'split', 'themes', 'sftp', 'import'].map((k) => ({ el: <FeatureScene {...FEATURES[k]} />, frames: featureFrames(FEATURES[k]) })),
  { el: <Privacy />, frames: sec(5) },
  { el: <Wall />, frames: sec(3.6) },
  { el: <Stats />, frames: sec(2.8) },
  { el: <EndCard />, frames: sec(5) },
];

export const TRAILER_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0) - (SCENES.length - 1) * T;

const transitionFor = (i: number) => (i === 0 || i === 6 ? fade() : slide({ direction: 'from-right' }));

export const Trailer: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      {SCENES.flatMap((s, i) => [
        ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={transitionFor(i - 1)} timing={linearTiming({ durationInFrames: T })} />] : []),
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.frames}>
          {s.el}
        </TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
  </AbsoluteFill>
);
