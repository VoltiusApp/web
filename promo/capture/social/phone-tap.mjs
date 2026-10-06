// A tap on the phone instance, on the first visible button whose text starts with argv[2]; logged to phone.cursor as down + up.
import { appendFileSync } from 'fs';
import * as m from './wd.mjs';
await m.ensureSession();
const r = await m.js(`var el=[...document.querySelectorAll('button,[role=button],a')].find(e=>{var b=e.getBoundingClientRect(); return b.width>0&&b.height>0&&b.height<90&&e.textContent.trim().startsWith(arguments[0]);});
  if(!el) return null; var b=el.getBoundingClientRect(); el.click(); return [b.left+b.width/2, b.top+b.height/2];`, [process.argv[2]]);
if (!r) throw new Error('phone-tap: nothing starts with ' + process.argv[2]);
const t = Date.now() / 1000;
appendFileSync('/tmp/work/phone.cursor', `${t.toFixed(3)} d ${Math.round(r[0])} ${Math.round(r[1])}\n${(t + 0.1).toFixed(3)} u ${Math.round(r[0])} ${Math.round(r[1])}\n`);
