import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Eyebrow, KineticLine, words } from '../components/Kinetic';
import { C, MONO, SANS } from '../theme';

const ROWS = ['web-01   deploy@10.0.4.12', 'db-primary   postgres@10.0.4.20', 'password   hunter2-prod!', 'key   id_ed25519 (private)'];
const HEX = '0123456789abcdef';

const cipher = (s: string, frame: number, row: number) =>
  s
    .split('')
    .map((ch, i) => (ch === ' ' ? ' ' : HEX[Math.floor(random(`${row}-${i}-${Math.floor(frame / 3)}`) * 16)]))
    .join('');

const Icon: React.FC<{ kind: 'laptop' | 'server' | 'phone' }> = ({ kind }) => {
  const s = { fill: 'none', stroke: C.text, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={34} height={34} viewBox="0 0 24 24">
      {kind === 'laptop' && (<><rect x="4" y="5" width="16" height="11" rx="1.5" {...s} /><path d="M2 19h20" {...s} /></>)}
      {kind === 'server' && (<><rect x="4" y="3" width="16" height="7" rx="1.5" {...s} /><rect x="4" y="14" width="16" height="7" rx="1.5" {...s} /><path d="M8 6.5h.01M8 17.5h.01" {...s} /></>)}
      {kind === 'phone' && (<><rect x="7" y="2.5" width="10" height="19" rx="2" {...s} /><path d="M11 18.5h2" {...s} /></>)}
    </svg>
  );
};

const Lock: React.FC<{ color: string }> = ({ color }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const Card: React.FC<{ title: string; kind: 'laptop' | 'server' | 'phone'; x: number; delay: number; encrypted?: boolean; note: string }> = ({ title, kind, x, delay, encrypted, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 380,
        width: 500,
        padding: '26px 28px',
        borderRadius: 22,
        background: C.card,
        border: `1px solid ${encrypted ? 'rgba(251,146,60,0.35)' : 'rgba(34,211,238,0.30)'}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${encrypted ? 'rgba(251,146,60,0.10)' : 'rgba(34,211,238,0.10)'}`,
        transform: `translateY(${(1 - p) * 80}px) scale(${0.94 + p * 0.06})`,
        opacity: p,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Icon kind={kind} />
        <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 600, color: C.text, flex: 1 }}>{title}</div>
        <Lock color={encrypted ? C.orange : C.cyan} />
      </div>
      {ROWS.map((r, i) => (
        <div key={i} style={{ fontFamily: MONO, fontSize: 19, padding: '9px 12px', marginBottom: 8, borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: encrypted ? C.orange : C.text, opacity: encrypted ? 0.85 : 1, whiteSpace: 'pre', overflow: 'hidden' }}>
          {encrypted ? cipher(r, frame, i) : r}
        </div>
      ))}
      <div style={{ fontFamily: SANS, fontSize: 18, color: C.muted, marginTop: 12 }}>{note}</div>
    </div>
  );
};

const Packets: React.FC<{ x1: number; x2: number; delay: number }> = ({ x1, x2, delay }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x1, top: 560, width: x2 - x1, height: 2, background: 'linear-gradient(90deg, rgba(34,211,238,0.0), rgba(34,211,238,0.35), rgba(251,146,60,0.35), rgba(251,146,60,0.0))', opacity: o }}>
      {[0, 1, 2].map((i) => {
        const t = (((frame - delay) / 26 + i / 3) % 1 + 1) % 1;
        return <div key={i} style={{ position: 'absolute', left: t * (x2 - x1) - 6, top: -5, width: 12, height: 12, borderRadius: 12, background: C.cyan, boxShadow: `0 0 16px ${C.cyan}` }} />;
      })}
    </div>
  );
};

export const Privacy: React.FC = () => {
  const frame = useCurrentFrame();
  const chips = ['Voltius Sync', 'GitHub Gist', 'Cloudflare R2', 'Any S3 bucket', 'Self-hosted'];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Eyebrow text="End-to-end encrypted sync" />
        <KineticLine items={words('Your data.', 'Only yours.')} delay={2} size={76} />
      </div>
      <Card title="Your laptop" kind="laptop" x={110} delay={10} note="Encrypted here, before it leaves." />
      <Packets x1={610} x2={710} delay={26} />
      <Card title="Sync server" kind="server" x={710} delay={18} encrypted note="Sees only ciphertext. Zero knowledge." />
      <Packets x1={1210} x2={1310} delay={30} />
      <Card title="Your phone" kind="phone" x={1310} delay={26} note="Decrypted only on your devices." />
      <div style={{ position: 'absolute', top: 905, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {chips.map((c, i) => {
          const o = interpolate(frame - 44 - i * 4, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={c} style={{ fontFamily: SANS, fontSize: 22, fontWeight: 500, color: C.text, padding: '10px 20px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.04)', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
              {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
