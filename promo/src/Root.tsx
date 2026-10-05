import React from 'react';
import { Composition } from 'remotion';
import { Trailer, TRAILER_FRAMES } from './Trailer';
import { FPS, H, W } from './theme';
import { Demo, DEMO_FRAMES, DH, DW } from './demo/Demo';
import { DeviceSync, DEVICE_SYNC_FRAMES } from './devices/DeviceSync';
import { FirstRun, FIRST_RUN_FRAMES } from './social/FirstRun';
import { ImportClip, importClipFrames, type ImportSource } from './social/ImportClip';
import { ResumeTransfer, RESUME_TRANSFER_FRAMES } from './social/ResumeTransfer';
import { KillRestore, KILL_RESTORE_FRAMES } from './social/KillRestore';
import { ThemeSpeedrun, THEME_SPEEDRUN_FRAMES } from './social/ThemeSpeedrun';
import { Broadcast, BROADCAST_FRAMES } from './social/Broadcast';
import { SyncClip, SYNC_CLIP_FRAMES } from './social/SyncClip';
import type { SyncStore } from '../../shared/devices/SyncScene';

export const Root: React.FC = () => (
  <>
    <Composition id="Trailer" component={Trailer} durationInFrames={TRAILER_FRAMES} fps={FPS} width={W} height={H} />
    <Composition
      id="ImportClip"
      component={ImportClip}
      durationInFrames={importClipFrames('termius')}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ source: 'termius' as ImportSource }}
      calculateMetadata={({ props }) => ({ durationInFrames: importClipFrames(props.source) })}
    />
    <Composition id="DeviceSync" component={DeviceSync} durationInFrames={DEVICE_SYNC_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="FirstRun" component={FirstRun} durationInFrames={FIRST_RUN_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="ResumeTransfer" component={ResumeTransfer} durationInFrames={RESUME_TRANSFER_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="KillRestore" component={KillRestore} durationInFrames={KILL_RESTORE_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="ThemeSpeedrun" component={ThemeSpeedrun} durationInFrames={THEME_SPEEDRUN_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Broadcast" component={Broadcast} durationInFrames={BROADCAST_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="SyncClip" component={SyncClip} durationInFrames={SYNC_CLIP_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ store: 'cloud' as SyncStore }} />
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_FRAMES} fps={30} width={DW} height={DH} />
  </>
);
