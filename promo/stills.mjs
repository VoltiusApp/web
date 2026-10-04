import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [id, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: `frames/${id}_${f}.png`, scale: 0.5 });
  console.log('ok', f);
}
