import data from './data.json';

export const DFPS = 30;
export type Src = 'A' | 'B';
export type Seg = { src: Src; from: number; to: number; rate: number };

const M = { A: data.A.marks, B: data.B.marks } as Record<Src, Record<string, number>>;
export const mk = (src: Src, name: string, d = 0) => M[src][name] + d;

// Cuts are [mark, offset seconds] so a retake with different app timing keeps the same edit.
type At = [string, number];
const seg = (src: Src, a: At, b: At, rate: number): Seg => ({ src, from: mk(src, ...a), to: mk(src, ...b), rate });
// For waits whose real length varies between takes (import, transfer): squeeze to a fixed on-screen duration.
const fit = (src: Src, a: At, b: At, seconds: number): Seg => seg(src, a, b, Math.max(1, (mk(src, ...b) - mk(src, ...a)) / seconds));
export const SEGS: Seg[] = [
  seg('A', ['import-open', -1.2], ['termius', 0.2], 1),
  seg('A', ['termius', 0.2], ['import', 0.1], 1.25),
  fit('A', ['import', 0.1], ['imported', 0.15], 2.5),
  seg('A', ['imported', 0.15], ['connect', 0], 1),
  fit('A', ['connect', 0], ['type', -0.1], 3.2),
  seg('A', ['type', -0.1], ['panel', -0.1], 1),
  seg('A', ['panel', -0.1], ['snippet', 0], 1),
  seg('A', ['docker', -0.1], ['themes', 0], 1),
  seg('A', ['themes', 0], ['palette', -0.1], 1.1),
  seg('A', ['palette', -0.1], ['split', -0.1], 1.15),
  seg('A', ['split', -0.1], ['end', -0.8], 1),
  seg('B', ['sftp', -0.25], ['dropped', 0.3], 1),
  fit('B', ['dropped', 0.3], ['landed', 0.1], 2),
  seg('B', ['landed', 0.1], ['end', -1.1], 1),
];

export const segFrames = (s: Seg) => Math.round(((s.to - s.from) * DFPS) / s.rate);

const starts: number[] = [];
let acc = 0;
for (const s of SEGS) { starts.push(acc); acc += segFrames(s); }
export const FOOTAGE_FRAMES = acc;
export const SEG_STARTS = starts;

export function sourceAt(frame: number): { src: Src; t: number } {
  let i = SEGS.length - 1;
  for (let k = 0; k < SEGS.length; k++) if (frame < starts[k] + segFrames(SEGS[k])) { i = k; break; }
  const s = SEGS[i];
  const local = Math.max(0, Math.min(frame - starts[i], segFrames(s)));
  return { src: s.src, t: s.from + (local / DFPS) * s.rate };
}

export function frameOf(src: Src, t: number): number {
  for (let k = 0; k < SEGS.length; k++) {
    const s = SEGS[k];
    if (s.src === src && t >= s.from && t <= s.to) return starts[k] + ((t - s.from) * DFPS) / s.rate;
  }
  let best = 0;
  for (let k = 0; k < SEGS.length; k++) {
    const s = SEGS[k];
    if (s.src !== src) continue;
    if (t > s.to) best = starts[k] + segFrames(s);
    else if (t < s.from) { best = starts[k]; break; }
  }
  return best;
}

type Sample = [number, string, number, number];
const CURSOR = { A: data.A.cursor as Sample[], B: data.B.cursor as Sample[] };
const lastA = CURSOR.A[CURSOR.A.length - 1];

export function cursorAt(src: Src, t: number): { x: number; y: number; pressed: boolean; lastDown: number } {
  const log = CURSOR[src];
  let prev: Sample | null = src === 'B' ? [-1e9, 'm', lastA[2], lastA[3]] : null;
  let next: Sample | null = null;
  let pressed = false;
  let lastDown = -1e9;
  for (const s of log) {
    if (s[0] <= t) {
      prev = s;
      if (s[1] === 'd') { pressed = true; lastDown = s[0]; }
      if (s[1] === 'u') pressed = false;
    } else { next = s; break; }
  }
  if (!prev) return { x: log[0][2], y: log[0][3], pressed, lastDown };
  if (!next || next[1] !== 'm' || next[0] - prev[0] > 0.25) return { x: prev[2], y: prev[3], pressed, lastDown };
  const k = (t - prev[0]) / (next[0] - prev[0]);
  return { x: prev[2] + (next[2] - prev[2]) * k, y: prev[3] + (next[3] - prev[3]) * k, pressed, lastDown };
}
