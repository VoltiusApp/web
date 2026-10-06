import React from 'react';
import { OffthreadVideo, Sequence, staticFile } from 'remotion';
import { FPS } from '../theme';
import { segFrames, type Timeline } from './take';

/** The timeline's cuts at recorded pixel size; overlay coordinates are the recording's. */
export const TakeFootage: React.FC<{ tl: Timeline }> = ({ tl }) => (
  <>
    {tl.segs.map((s, i) => {
      const take = tl.takes[s.take];
      return (
        <Sequence key={i} from={tl.starts[i]} durationInFrames={segFrames(s)} layout="none">
          <OffthreadVideo src={staticFile(take.src)} trimBefore={Math.round(s.from * FPS)} playbackRate={s.rate} muted style={{ position: 'absolute', inset: 0, width: take.w, height: take.h }} />
        </Sequence>
      );
    })}
  </>
);

/** The recorded pointer, or with `touch` only the ring where a finger tapped. */
export const TakeCursor: React.FC<{ tl: Timeline; frame: number; touch?: boolean }> = ({ tl, frame, touch }) => {
  const { take, t } = tl.sourceAt(Math.min(frame, tl.frames - 1));
  if (!tl.takes[take].cursor.length) return null;
  const c = tl.cursorAt(take, t);
  const since = t - c.lastDown;
  const ring = since >= 0 && since < 0.45 ? since / 0.45 : -1;
  return (
    <>
      {ring >= 0 && (
        <div style={{ position: 'absolute', left: c.x - 22, top: c.y - 22, width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(87,199,216,0.9)', transform: `scale(${0.3 + ring * 0.9})`, opacity: 1 - ring }} />
      )}
      {!touch && <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: 'absolute', left: c.x - 4, top: c.y - 2, transform: `scale(${c.pressed ? 0.88 : 1})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))' }}>
        <path d="M4 2 L4 19 L8.5 14.8 L11.6 21.6 L14.4 20.4 L11.4 13.7 L17.6 13.4 Z" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>}
    </>
  );
};
