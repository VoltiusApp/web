import React from 'react';
import { asTake, cutters, timeline } from '../components/take';
import { accented } from '../components/Caption';
import { clipFrames, drift, FootageClip, hold, shots } from './FootageClip';
import resume from './takes/resume.json';

const { WIDE, focus } = shots('window');

const TAKES = { a: asTake(resume) };
const { seg, fit } = cutters(TAKES);
// queue2 is the click that reopens the transfer queue while the link is down.
const TL = timeline(TAKES, [
  seg('a', ['drag', -0.8], ['dropped', 0.6], 1.5),
  fit('a', ['dropped', 0.6], ['cut', 0], 1.6),
  fit('a', ['cut', 0], ['queue2', -0.7], 1.6),
  seg('a', ['queue2', -0.7], ['back', 0], 1.4),
  seg('a', ['back', 0], ['resumed', 1.4], 1.2),
  fit('a', ['resumed', 1.4], ['done', 0], 1.8),
  seg('a', ['done', 0], ['end', -0.6]),
]);
const at = (m: string, d = 0) => TL.at('a', m, d);
const QUEUE = focus(1105, 770, 2.0, { dx: 150, dy: 330 });

export const RESUME_TRANSFER_FRAMES = clipFrames(TL);

export const ResumeTransfer: React.FC = () => (
  <FootageClip
    device="window"
    tl={TL}
    cams={[
      [0, WIDE],
      [at('drag', 0.2), focus(640, 400, 0.88)],
      [at('dropped', 0.6), focus(950, 560, 1.0, { dx: -60 })],
      ...hold(at('queue2', -0.4), at('resumed', 1.4), QUEUE),
      [at('done', -0.2), focus(950, 560, 1.0, { dx: -60 })],
      [at('done', 0.6), QUEUE],
      [TL.frames, drift(QUEUE)],
    ]}
    cues={[
      { from: 4, to: at('cut', -0.1), text: accented('4 GB to web-01.') },
      { from: at('cut', 0), to: at('queue2', -0.5), text: accented('Then the link', 'drops.') },
      { from: at('queue2', -0.4), to: at('back', 0), text: 'Voltius waits for it.' },
      { from: at('back', 0.1), to: at('done', 0), text: accented('It picks up', 'where it stopped.') },
      { from: at('done', 0.1), to: TL.frames, text: accented('Nothing', 'starts over.') },
    ]}
    footer="resumable SFTP transfers · new in 0.49"
  />
);
