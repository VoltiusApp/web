import { writeFileSync } from 'fs';
import { takeData } from '../take-data.mjs';
const dir = new URL('../../public/demo', import.meta.url).pathname;
const out = { A: takeData(dir, 'A'), B: takeData(dir, 'B') };
writeFileSync(new URL('../../src/demo/data.json', import.meta.url), JSON.stringify(out));
console.log(JSON.stringify({ A: out.A.marks, B: out.B.marks }), out.A.cursor.length, out.B.cursor.length);
