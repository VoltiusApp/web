import { readFileSync } from 'fs';
import * as m from './wd.mjs';
await m.ensureSession();
const [src, arg] = process.argv.slice(2);
const body = src.endsWith('.js') ? readFileSync(src, 'utf8') : src;
const out = await m.jsAsync(body, [arg ?? null]);
console.log(typeof out === 'string' ? out : JSON.stringify(out));
