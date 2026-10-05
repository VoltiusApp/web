// npm run render:all [-- --force] [-- --only 1,23] [-- --gl swangle] [-- --frames 0-30] — social.json → out/social/<tweetId>.mp4 + review.html.
// Existing files are kept unless --force or named in --only.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { webpackOverride } from './webpack-override.mjs';

process.chdir(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const only = opt('only')?.split(',').map((s) => s.trim());
const chromiumOptions = { gl: opt('gl') ?? 'angle' };
const frameRange = opt('frames')?.split('-').map(Number);

const SOCIAL = JSON.parse(readFileSync('social.json', 'utf8'));
const QUEUE_PATH = path.join('..', 'social', 'queue.json');
const queue = existsSync(QUEUE_PATH) ? JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) : [];
const tweet = (id) => queue.find((t) => String(t.id) === String(id));
const OUT = path.join('out', 'social');
mkdirSync(OUT, { recursive: true });

const ids = Object.keys(SOCIAL).filter((id) => !only || only.includes(id));
const todo = ids.filter((id) => flag('force') || only || !existsSync(path.join(OUT, `${id}.mp4`)));
const key = (job) => JSON.stringify([job.composition, job.props ?? {}]);
const done = new Map();
const status = {};

if (todo.length) {
  console.log(`Bundling… (${todo.length} to render, gl=${chromiumOptions.gl})`);
  const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), webpackOverride });
  for (const [i, id] of todo.entries()) {
    const job = SOCIAL[id];
    const out = path.join(OUT, `${id}.mp4`);
    const label = `[${i + 1}/${todo.length}] #${id} ${job.composition} ${JSON.stringify(job.props ?? {})}`;
    // Two tweets with the same composition and props share one render.
    if (done.has(key(job))) {
      writeFileSync(out, readFileSync(done.get(key(job))));
      console.log(`${label} copied`);
      status[id] = 'rendered';
      continue;
    }
    const inputProps = job.props ?? {};
    const composition = await selectComposition({ serveUrl, id: job.composition, inputProps, chromiumOptions });
    const tmp = `${out}.part.mp4`;
    let last = -1;
    await renderMedia({
      serveUrl, composition, inputProps, chromiumOptions, codec: 'h264', crf: 18, imageFormat: 'jpeg', jpegQuality: 92,
      outputLocation: tmp,
      ...(frameRange && { frameRange }),
      onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`\r${label} ${p * 10}%`); } },
    });
    renameSync(tmp, out);
    process.stdout.write('\n');
    done.set(key(job), out);
    status[id] = 'rendered';
  }
}

const rows = Object.keys(SOCIAL).map((id) => {
  const file = path.join(OUT, `${id}.mp4`);
  const t = tweet(id);
  return {
    id, file, date: t?.date ?? '', visual: t?.visual ?? '', text: t?.text ?? '', composition: SOCIAL[id].composition, props: SOCIAL[id].props ?? {},
    state: existsSync(file) ? status[id] ?? 'kept' : 'missing', mb: existsSync(file) ? (statSync(file).size / 1e6).toFixed(1) : '',
  };
}).sort((a, b) => a.date.localeCompare(b.date));
const unmapped = queue.filter((t) => t.media === 'video' && !SOCIAL[t.id]).sort((a, b) => a.date.localeCompare(b.date));

console.log('\nReview list (posting order):');
for (const r of rows) console.log(`  ${r.date || '????-??-??'}  #${String(r.id).padEnd(3)} ${r.state.padEnd(8)} ${r.file.padEnd(22)} ${r.composition}${Object.keys(r.props).length ? ' ' + JSON.stringify(r.props) : ''}`);
if (unmapped.length) {
  console.log('\nVideo tweets with no composition yet:');
  for (const t of unmapped) console.log(`  ${t.date}  #${String(t.id).padEnd(3)} ${t.visual ?? ''}`);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
writeFileSync(path.join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><title>Tweet videos</title>
<style>body{font:15px system-ui;background:#0b0f17;color:#e5e7eb;margin:24px}article{display:grid;grid-template-columns:640px 1fr;gap:20px;margin:0 0 28px;padding:16px;background:#121826;border-radius:12px}video{width:640px;border-radius:8px;background:#000}h2{margin:0 0 6px;font-size:17px}small{color:#94a3b8}p{white-space:pre-wrap}code{color:#67e8f9}</style>
<h1>Tweet videos</h1><p>Approve: copy <code>out/social/&lt;id&gt;.mp4</code> to <code>social/media/&lt;id&gt;.mp4</code>, push, then label the tweet's approval issue <code>approved</code>.</p>
${rows.map((r) => `<article>${r.state === 'missing' ? '<div>not rendered</div>' : `<video src="${r.id}.mp4" controls loop muted preload="metadata"></video>`}<div><h2>#${r.id} · ${esc(r.date)} · ${esc(r.visual)}</h2><small>${esc(r.composition)} ${esc(JSON.stringify(r.props))} · ${r.mb} MB</small><p>${esc(r.text)}</p></div></article>`).join('\n')}
${unmapped.length ? `<h2>No composition yet</h2><ul>${unmapped.map((t) => `<li>#${t.id} · ${esc(t.date)} · ${esc(t.visual ?? '')}</li>`).join('')}</ul>` : ''}`);
console.log(`\nOpen ${path.join(OUT, 'review.html')} to watch them side by side with the tweet text.`);
