import { ensureSession, sleep, shot, clickRow } from './wd.mjs';
await ensureSession();
console.log(await clickRow('web-01', { xmin: 740 }));
await sleep(4000);
await shot('/tmp/work/look.png');
