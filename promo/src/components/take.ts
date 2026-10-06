import { FPS } from '../theme';

// [seconds since recording start, 'm' | 'd' | 'u', x, y] in recorded pixels.
export type Sample = [number, string, number, number];
// start: the first frame's wall clock, so takes recorded side by side can be synced.
export type Take = { src: string; w: number; h: number; start?: number; marks: Record<string, number>; cursor: Sample[] };
// JSON imports widen the cursor tuples; pull.sh writes exactly this shape.
export const asTake = (json: { src: string; w: number; h: number; marks: object; cursor: unknown[] }) => json as unknown as Take;
export type Seg = { take: string; from: number; to: number; rate: number };
export type At = [string, number];
export type CursorState = { x: number; y: number; pressed: boolean; lastDown: number };

export const segFrames = (s: Seg) => Math.round(((s.to - s.from) * FPS) / s.rate);

export const markOf = (takes: Record<string, Take>) => (take: string, name: string, d = 0) => {
  const m = takes[take].marks[name];
  if (m === undefined) throw new Error(`take ${take} has no mark ${name}`);
  return m + d;
};

// Cuts are [mark, offset seconds] so a retake with different app timing keeps the same edit.
export const cutters = (takes: Record<string, Take>) => {
  const mk = markOf(takes);
  const seg = (take: string, a: At, b: At, rate = 1): Seg => ({ take, from: mk(take, ...a), to: mk(take, ...b), rate });
  // For waits whose real length varies between takes (import, transfer): squeeze to a fixed on-screen duration.
  const fit = (take: string, a: At, b: At, seconds: number): Seg => seg(take, a, b, Math.max(1, (mk(take, ...b) - mk(take, ...a)) / seconds));
  return { mk, seg, fit };
};

function cursorIn(log: Sample[], t: number, initial?: Sample): CursorState {
  let prev: Sample | null = initial ?? null;
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
  if (!prev) return log.length ? { x: log[0][2], y: log[0][3], pressed, lastDown } : { x: -100, y: -100, pressed, lastDown };
  if (!next || next[1] !== 'm' || next[0] - prev[0] > 0.25) return { x: prev[2], y: prev[3], pressed, lastDown };
  const k = (t - prev[0]) / (next[0] - prev[0]);
  return { x: prev[2] + (next[2] - prev[2]) * k, y: prev[3] + (next[3] - prev[3]) * k, pressed, lastDown };
}

/** Maps output frames to moments of one or more recorded takes, cut into segments. */
export function timeline(takes: Record<string, Take>, segs: Seg[], carryCursor: string[][] = []) {
  const starts: number[] = [];
  let acc = 0;
  for (const s of segs) { starts.push(acc); acc += segFrames(s); }
  const frames = acc;

  const sourceAt = (frame: number): { take: string; t: number } => {
    let i = segs.length - 1;
    for (let k = 0; k < segs.length; k++) if (frame < starts[k] + segFrames(segs[k])) { i = k; break; }
    const s = segs[i];
    const local = Math.max(0, Math.min(frame - starts[i], segFrames(s)));
    return { take: s.take, t: s.from + (local / FPS) * s.rate };
  };

  const frameOf = (take: string, t: number): number => {
    for (let k = 0; k < segs.length; k++) {
      const s = segs[k];
      if (s.take === take && t >= s.from && t <= s.to) return starts[k] + ((t - s.from) * FPS) / s.rate;
    }
    let best = 0;
    for (let k = 0; k < segs.length; k++) {
      const s = segs[k];
      if (s.take !== take) continue;
      if (t > s.to) best = starts[k] + segFrames(s);
      else if (t < s.from) { best = starts[k]; break; }
    }
    return best;
  };

  // A take recorded right after another starts with the pointer where the previous one left it.
  const initial: Record<string, Sample> = {};
  for (const [before, after] of carryCursor) {
    const last = takes[before].cursor[takes[before].cursor.length - 1];
    if (last) initial[after] = [-1e9, 'm', last[2], last[3]];
  }
  const cursorAt = (take: string, t: number) => cursorIn(takes[take].cursor, t, initial[take]);

  const mk = markOf(takes);
  // Output frame of a mark (+ offset seconds of recording).
  const at = (take: string, name: string, d = 0) => Math.round(frameOf(take, mk(take, name, d)));
  return { takes, segs, starts, frames, sourceAt, frameOf, cursorAt, mk, at };
}

export type Timeline = ReturnType<typeof timeline>;
