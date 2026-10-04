import { loadFont } from '@remotion/google-fonts/Geist';
import { loadFont as loadMono } from '@remotion/google-fonts/GeistMono';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#05060a',
  text: '#f4f5f8',
  muted: '#8c90a0',
  dim: '#5b5f6e',
  cyan: '#22d3ee',
  cyanDeep: '#06b6d4',
  blue: '#3b82f6',
  orange: '#fb923c',
  amber: '#fbbf24',
  green: '#22c55e',
  line: 'rgba(255,255,255,0.08)',
  card: 'rgba(17,19,28,0.82)',
};

export const ACCENT_GRADIENT = `linear-gradient(100deg, ${C.cyan} 0%, ${C.blue} 100%)`;
export const BOLT_GRADIENT = `linear-gradient(100deg, ${C.cyan} 0%, ${C.blue} 55%, ${C.orange} 100%)`;

export const { fontFamily: SANS } = loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
export const { fontFamily: MONO } = loadMono('normal', { weights: ['400', '500', '600'], subsets: ['latin'] });

export const sec = (s: number) => Math.round(s * FPS);
