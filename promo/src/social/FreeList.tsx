import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { accented } from '../components/Caption';
import { C, SANS, sec } from '../theme';
import { PLANS } from '../../../shared/plans';
import { ClipFrame, clipFrames } from './FootageClip';

const FREE = PLANS.find((p) => p.id === 'free')!.features;
const START = sec(1.2);
const STAGGER = 7;
const LISTED = START + FREE.length * STAGGER + sec(1.6);
const PAID = LISTED + sec(3.2);
const SCENE = PAID + sec(2.4);

export const FREE_LIST_FRAMES = clipFrames({ frames: SCENE });

const Item: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 16 });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px', borderRadius: 20, background: C.card, border: `1px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 600, color: C.text, letterSpacing: -0.6, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
};

export const FreeList: React.FC = () => (
  <ClipFrame
    frames={SCENE}
    headline="Free · Open source · No account required"
    cues={[
      { from: 4, to: LISTED, text: accented('Free.', 'Forever.') },
      { from: LISTED, to: PAID, text: accented('Paid plans add', 'Voltius Cloud and teams.') },
      { from: PAID, to: SCENE, text: accented('They never take', 'features away.') },
    ]}
  >
    <AbsoluteFill style={{ padding: '250px 110px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 'min-content', columnGap: 34, rowGap: 22 }}>
      {FREE.map((f, i) => <Item key={f} text={f} at={START + i * STAGGER} />)}
    </AbsoluteFill>
  </ClipFrame>
);
