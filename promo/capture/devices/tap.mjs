import * as m from './wd.mjs';
await m.ensureSession();
console.log(JSON.stringify(await m.js(`var el=document.querySelector(arguments[0]); var r=el.getBoundingClientRect(); el.click(); return [Date.now()/1000, r.left+r.width/2, r.top+r.height/2];`, [process.argv[2]])));
