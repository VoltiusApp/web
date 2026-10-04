import { readFileSync, writeFileSync } from 'fs';
const dir = new URL('../../public/demo/', import.meta.url).pathname;
const out = {};
for (const k of ['A', 'B']) {
  const start = +readFileSync(dir + k + '.start', 'utf8').trim();
  const rel = (e) => +(+e - start).toFixed(3);
  const cursor = readFileSync(dir + k + '.cursor', 'utf8').trim().split('\n').map((l) => { const [e, kind, x, y] = l.split(' '); return [rel(e), kind, +x, +y]; });
  const marks = Object.fromEntries(readFileSync(dir + k + '.marks', 'utf8').trim().split('\n').map((l) => { const [e, n] = l.split(' '); return [n, rel(e)]; }));
  out[k] = { cursor, marks };
}
writeFileSync(new URL('../../src/demo/data.json', import.meta.url), JSON.stringify(out));
console.log(JSON.stringify({ A: out.A.marks, B: out.B.marks }), out.A.cursor.length, out.B.cursor.length);
