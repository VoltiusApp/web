import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AppWindow, Segment, Zoom } from '../components/AppWindow';
import { Eyebrow, KineticLine, Word } from '../components/Kinetic';

export const FeatureScene: React.FC<{
  eyebrow: string;
  title: Word[];
  src: string;
  segments: Segment[];
  zooms?: Zoom[];
}> = ({ eyebrow, title, src, segments, zooms }) => (
  <AbsoluteFill>
    <AppWindow src={src} segments={segments} zooms={zooms} enterDelay={6} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(180deg, rgba(5,6,10,0.96) 0%, rgba(5,6,10,0.85) 55%, rgba(5,6,10,0) 100%)' }} />
    <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <Eyebrow text={eyebrow} />
      <KineticLine items={title} delay={2} size={72} />
    </div>
  </AbsoluteFill>
);
