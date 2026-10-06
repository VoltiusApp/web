import React from 'react';
import { useCurrentFrame } from 'remotion';
import { asTake, cutters, timeline } from '../components/take';
import { accented } from '../components/Caption';
import { TakeCursor, TakeFootage } from '../components/TakeFootage';
import { Phone } from '../../../shared/devices/Phone';
import { Stage, type Cam } from '../../../shared/devices/Stage';
import { keyframes } from '../../../shared/devices/motion';
import { ClipFrame, clipFrames, drift, hold } from './FootageClip';
import phone from './takes/phone.json';

const TAKES = { a: asTake(phone) };
const { seg } = cutters(TAKES);
const TL = timeline(TAKES, [seg('a', ['open', -1.6], ['build', 0.5], 1.1), seg('a', ['build', 0.5], ['end', -0.3], 1.3)]);
const at = (m: string, d = 0) => TL.at('a', m, d);
const LIST: Cam = { x: 120, y: 40, s: 0.92, rx: -4, ry: -10 };
const TERM: Cam = { x: 120, y: 170, s: 1.2, rx: -2, ry: -6 };

export const PHONE_CLIP_FRAMES = clipFrames(TL);

export const PhoneClip: React.FC = () => {
  const frame = useCurrentFrame();
  const take = TL.takes.a;
  return (
    <ClipFrame
      frames={TL.frames}
      footer="Voltius for Android · end-to-end encrypted sync"
      cues={[
        { from: 4, to: at('open'), text: accented('Your hosts,', 'synced to your phone.') },
        { from: at('open'), to: at('build'), text: 'Tap one.' },
        { from: at('build'), to: TL.frames, text: accented('A live terminal', 'in your pocket.') },
      ]}
    >
      <Stage cam={keyframes(frame, [...hold(0, at('open', 0.4), LIST), [at('shell', 0.6), TERM], [TL.frames, drift(TERM)]])}>
        <Phone
          on={1}
          x={0}
          y={470}
          appW={take.w}
          appH={take.h}
          screen={
            <div style={{ position: 'relative', width: take.w, height: take.h }}>
              <TakeFootage tl={TL} />
              <TakeCursor tl={TL} frame={frame} touch />
            </div>
          }
        />
      </Stage>
    </ClipFrame>
  );
};
