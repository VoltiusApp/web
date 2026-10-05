import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import { webpackOverride } from './webpack-override.mjs';
// Software GL other than swangle mis-sorts the CSS 3D device planes; the GPU path (--gl=angle) is fine.
const chromiumOptions = { gl: process.env.GL ?? 'swangle' };
const [id, ...frames] = process.argv.slice(2);
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {};
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), webpackOverride });
const composition = await selectComposition({ serveUrl, id, inputProps, chromiumOptions });
const tag = process.env.TAG ? `_${process.env.TAG}` : '';
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), inputProps, chromiumOptions, output: `frames/${id}${tag}_${f}.png`, scale: 0.5 });
  console.log('ok', f);
}
