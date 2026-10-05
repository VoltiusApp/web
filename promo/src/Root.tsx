import React from 'react';
import { Composition } from 'remotion';
import { Trailer, TRAILER_FRAMES } from './Trailer';
import { ImportClip, IMPORT_CLIP_FRAMES } from './ImportClip';
import { FPS, H, W } from './theme';
import { Demo, DEMO_FRAMES, DH, DW } from './demo/Demo';
import { DeviceSync, DEVICE_SYNC_FRAMES } from './devices/DeviceSync';

export const Root: React.FC = () => (
  <>
    <Composition id="Trailer" component={Trailer} durationInFrames={TRAILER_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="ImportClip" component={ImportClip} durationInFrames={IMPORT_CLIP_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="DeviceSync" component={DeviceSync} durationInFrames={DEVICE_SYNC_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_FRAMES} fps={30} width={DW} height={DH} />
  </>
);
