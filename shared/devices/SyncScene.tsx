import React from 'react';
import { Laptop } from './Laptop';
import { Phone } from './Phone';
import { Stage } from './Stage';
import { ramp } from './motion';

const PLAIN = ['name  web-01', 'host  web-01.acme.io', 'port  2222', 'user  deploy', 'auth  ed25519'];
// Real AES-256-GCM output of that record, so the ciphertext on screen is the genuine article.
const CIPHER = 'RhvttsllxWb3UpmhwuIz6GxnI/fdCjNGhF0GAjrKknprr9So5hkGGc4aSQDFuLW5gOAnqSTmfDh3JJgHY88VDoXGND/z8DLbfuaYKZ0E8z81q6HAG2xi8TJSTTD3cIc4ZAROEfDVisSm2FSz+ohC8wPm';
const COLS = 20;
const cipherLine = (i: number) => CIPHER.slice(i * COLS, (i + 1) * COLS);
const STORED = [
  { key: 'vault/7527f26b.enc', body: 'bPppEp8Ia9cqjhbaNxf9BZZQgXkXs/BryL5ATeBX' },
  { key: 'vault/4803dcfa.enc', body: '8KzKULk7faWAyRzI6fj/6b15Y3lOfyMcv6A5XlvH' },
];
const ARRIVED = { key: 'vault/3f9c81d2.enc', body: CIPHER.slice(0, 40) };

export const SYNC_CAPTIONS = [
  { from: 0, to: 0.3, text: 'Encrypted on your laptop.' },
  { from: 0.3, to: 0.62, text: 'Your bucket only ever holds ciphertext.' },
  { from: 0.62, to: 1, text: 'Decrypted on your phone.' },
];

const P = { laptop: { x: 480, y: 330 }, bucket: { x: 960, y: 330 }, phone: { x: 1450, y: 360 } };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const hop = (from: { x: number; y: number }, to: { x: number; y: number }, k: number) => ({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) - 140 * Math.sin(Math.PI * k) });
const order = (i: number) => ((i * 7919) % 101) / 101;

const Lock: React.FC<{ open: number; color: string }> = ({ open, color }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d={`M7 11V7a5 5 0 0 1 10 0v${4 - open * 4}`} />
  </svg>
);

const Record: React.FC<{ at: { x: number; y: number }; cipher: number; opacity: number; accent: string; mono: string }> = ({ at, cipher, opacity, accent, mono }) => (
  <div style={{ position: 'absolute', left: at.x, top: at.y, transform: 'translate(-50%, -50%)', opacity, width: 330, padding: '16px 20px', borderRadius: 14, background: 'rgba(10,14,22,0.94)', border: `1px solid ${cipher > 0.5 ? 'rgba(148,163,184,0.25)' : accent}`, boxShadow: '0 20px 50px rgba(0,0,0,0.55)', fontFamily: mono, fontSize: 19, lineHeight: '28px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontFamily: 'inherit', color: cipher > 0.5 ? '#94a3b8' : accent, fontSize: 15, letterSpacing: 1 }}>
      <Lock open={1 - cipher} color={cipher > 0.5 ? '#94a3b8' : accent} />
      {cipher > 0.5 ? 'AES-256-GCM' : 'HOST'}
    </div>
    {PLAIN.map((line, r) => (
      <div key={r} style={{ whiteSpace: 'pre' }}>
        {Array.from({ length: COLS }, (_, c) => {
          const scrambled = order(r * COLS + c) < cipher;
          return (
            <span key={c} style={{ color: scrambled ? '#64748b' : '#e2e8f0' }}>
              {scrambled ? cipherLine(r)[c] : (line[c] ?? ' ')}
            </span>
          );
        })}
      </div>
    ))}
  </div>
);

const Bucket: React.FC<{ arrived: number; mono: string }> = ({ arrived, mono }) => (
  <div style={{ position: 'absolute', left: P.bucket.x, top: P.bucket.y, transform: 'translate(-50%, -50%)', width: 520, padding: '22px 26px', borderRadius: 20, background: 'rgba(15,20,32,0.9)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
    <div style={{ fontSize: 24, fontWeight: 600, color: '#f1f5f9' }}>Your bucket</div>
    <div style={{ fontSize: 16, color: '#8c90a0', marginTop: 4, marginBottom: 16 }}>S3 · R2 · GitHub Gist — storage you own</div>
    {[...STORED, ...(arrived > 0 ? [ARRIVED] : [])].map((o, i) => (
      <div key={o.key} style={{ fontFamily: mono, fontSize: 15, lineHeight: '22px', padding: '10px 0', borderTop: '1px solid rgba(148,163,184,0.12)', opacity: i === STORED.length ? arrived : 1 }}>
        <div style={{ color: '#94a3b8' }}>{o.key}</div>
        <div style={{ color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.body}</div>
      </div>
    ))}
  </div>
);

/** E2EE sync explainer on a 1920×1080 canvas; `p` runs 0 → 1. */
export const SyncScene: React.FC<{ p: number; laptopScreen: React.ReactNode; phoneScreen: React.ReactNode; mono: string; accent?: string }> = ({
  p,
  laptopScreen,
  phoneScreen,
  mono,
  accent = '#22d3ee',
}) => {
  const encrypt = ramp(p, 0.1, 0.24);
  const up = ramp(p, 0.26, 0.42);
  const arrived = ramp(p, 0.4, 0.46);
  const down = ramp(p, 0.52, 0.68);
  const decrypt = ramp(p, 0.7, 0.84);
  const first = up < 1;
  const at = first ? hop(P.laptop, P.bucket, up) : hop(P.bucket, P.phone, down);
  const opacity = first ? ramp(p, 0, 0.06) * (1 - ramp(p, 0.4, 0.44)) : ramp(p, 0.5, 0.54);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage cam={{ x: 0, y: -150, s: 0.56, rx: -12, ry: 0 }}>
        <Laptop lid={12} x={-900} y={480} screen={laptopScreen} />
        <Phone on={1} x={880} y={480} z={160} scale={1.15} tilt={{ x: 6, y: -14 }} screen={phoneScreen} />
      </Stage>
      <Bucket arrived={arrived} mono={mono} />
      <Record at={at} cipher={first ? encrypt : 1 - decrypt} opacity={opacity} accent={accent} mono={mono} />
    </div>
  );
};
