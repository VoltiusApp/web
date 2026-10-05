export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Overdamped spring (stiffness 100, damping 200, mass 1) stretched to `duration`, matching Remotion's spring({ config: { damping: 200 }, durationInFrames }).
const W0 = 10;
const ZETA = 10;
const R1 = -W0 * (ZETA - Math.sqrt(ZETA * ZETA - 1));
const R2 = -W0 * (ZETA + Math.sqrt(ZETA * ZETA - 1));
const C1 = R2 / (R2 - R1);
const C2 = -R1 / (R2 - R1);
const rawSpring = (s: number) => 1 - (C1 * Math.exp(R1 * s) + C2 * Math.exp(R2 * s));
const NATURAL = Math.log(0.005 / C1) / R1;

export const settle = (elapsed: number, duration: number) => (elapsed <= 0 ? 0 : rawSpring(NATURAL * clamp01(elapsed / duration)) / rawSpring(NATURAL));

export const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export const ramp = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));

export const keyframes = <T extends Record<string, number>>(t: number, keys: [number, T][]): T => {
  const i = Math.max(0, keys.findIndex(([at], j) => t >= at && t < (keys[j + 1]?.[0] ?? Infinity)));
  const [t0, a] = keys[i];
  const [t1, b] = keys[Math.min(i + 1, keys.length - 1)];
  const k = t1 === t0 ? 1 : easeInOutCubic(clamp01((t - t0) / (t1 - t0)));
  return Object.fromEntries(Object.keys(a).map((key) => [key, a[key] + (b[key] - a[key]) * k])) as T;
};
