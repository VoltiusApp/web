import { ensureSession, js, sleep, shot } from './wd.mjs';
await ensureSession();
for (let i = 0; i < 90; i++) { const t = await js('return document.body.innerText'); if (t && t.length > 50 && !/Checking vault|Initializing/.test(t)) break; await sleep(1000); }
console.log(JSON.stringify(await js('return [innerWidth, innerHeight, devicePixelRatio, document.body.innerText.slice(0,300)]')));
await shot('/tmp/work/boot.png');
