import { ensureSession, shot, js, sleep } from './wd.mjs';
await ensureSession();
for (let i = 0; i < 30; i++) { const n = await js('return document.body.innerHTML.length'); if (n > 5000) break; await sleep(2000); }
await sleep(2000);
console.log(await js('return [document.body.innerHTML.length, innerWidth, innerHeight]'));
await shot('/tmp/work/boot.png');
