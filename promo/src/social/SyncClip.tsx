import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { accented } from '../components/Caption';
import { MONO, sec } from '../theme';
import { ClipFrame, clipFrames } from './FootageClip';
import { SyncScene, syncCaptions, type SyncStore } from '../../../shared/devices/SyncScene';
import { PLANS, trialCardLabel, trialLabel } from '../../../shared/plans';

const SCENE = sec(10);
const HOLD = sec(0.8);
export const SYNC_CLIP_FRAMES = clipFrames({ frames: SCENE + HOLD });

const pro = PLANS.find((p) => p.id === 'pro')!;
const COPY: Record<SyncStore, { headline: string; footer: string }> = {
  cloud: { headline: `Voltius Cloud · Pro · ${trialLabel(pro.trial!)}, ${trialCardLabel(pro.trial!)}`, footer: 'end-to-end encrypted · XChaCha20-Poly1305 · real-time sync' },
  byo: { headline: 'Gist, Cloudflare R2 and S3 sync plugins · free', footer: 'end-to-end encrypted · XChaCha20-Poly1305 · storage you own' },
};

const still = (src: string) => <Img src={staticFile(src)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />;

export const SyncClip: React.FC<{ store: SyncStore }> = ({ store }) => {
  const frame = useCurrentFrame();
  const cues = syncCaptions(store).map((c, i, all) => ({ from: Math.max(4, Math.round(c.from * SCENE)), to: i === all.length - 1 ? SCENE + HOLD : Math.round(c.to * SCENE), text: accented(c.text) }));
  return (
    <ClipFrame frames={SCENE + HOLD} cues={cues} headline={COPY[store].headline} footer={COPY[store].footer}>
      <SyncScene p={Math.min(1, frame / SCENE)} store={store} mono={MONO} laptopScreen={still('sync/laptop-hosts.png')} phoneScreen={still('sync/phone-hosts.webp')} />
    </ClipFrame>
  );
};
