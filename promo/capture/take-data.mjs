import { readFileSync } from 'fs';

// rec.sh output (NAME.start/.cursor/.marks, epoch seconds) → times relative to the recording's first frame.
export function takeData(dir, name) {
  const start = +readFileSync(`${dir}/${name}.start`, 'utf8').trim();
  const rel = (e) => +(+e - start).toFixed(3);
  const lines = (ext) => readFileSync(`${dir}/${name}.${ext}`, 'utf8').trim().split('\n').filter(Boolean);
  const cursor = lines('cursor').map((l) => { const [e, kind, x, y] = l.split(' '); return [rel(e), kind, +x, +y]; });
  const marks = Object.fromEntries(lines('marks').map((l) => { const [e, n] = l.split(' '); return [n, rel(e)]; }));
  return { cursor, marks };
}
