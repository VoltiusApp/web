import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Background } from './components/Background';
import { footageFrames } from './components/AppWindow';
import { KineticLine, words } from './components/Kinetic';
import { FeatureScene } from './scenes/FeatureScene';
import { EndCard } from './scenes/EndCard';
import { FEATURES } from './Trailer';
import { C, SANS, sec } from './theme';

const SOURCES = ['Termius', 'PuTTY / KiTTY', 'SecureCRT', 'ZOC Terminal', 'MobaXterm', 'CSV'];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', marginTop: -120 }}>
        <KineticLine items={words('Switching SSH clients means', 'rebuilding everything.').map((w) => (w.accent ? { ...w, accent: false, strikeAt: w.t === 'rebuilding' ? 26 : 30 } : w))} size={70} />
      </div>
      <div style={{ marginTop: 34 }}>
        <KineticLine items={words('Not anymore.')} delay={40} size={70} color={C.cyan} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 80 }}>
        {SOURCES.map((s, i) => {
          const p = spring({ frame: frame - 54 - i * 4, fps, config: { damping: 13, stiffness: 160 } });
          return (
            <div key={s} style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, color: C.text, padding: '16px 30px', borderRadius: 999, background: 'rgba(17,19,28,0.85)', border: '1px solid rgba(34,211,238,0.3)', transform: `translateY(${(1 - p) * 50}px) scale(${0.7 + p * 0.3})`, opacity: Math.min(1, p * 1.5) }}>
              {s}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const T = 12;
const HOOK = sec(4);
const DEMO = footageFrames(FEATURES.import.segments) + 14;
const END = sec(4);
export const IMPORT_CLIP_FRAMES = HOOK + DEMO + END - 2 * T;

export const ImportClip: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={HOOK}><Hook /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={DEMO}>
        <FeatureScene {...FEATURES.import} eyebrow="Import from PuTTY, Termius, SecureCRT, ZOC…" title={words('Every host.', 'One click.')} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={END}><EndCard headline="Free · Open source · Your data stays yours" /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
