import { ensureSession, sleep, shot, clickRow, sendKeys } from './wd.mjs';
await ensureSession();
console.log(await clickRow('Local Machine', { xmax: 700 }));
await sleep(1500);
console.log(await clickRow('web-01', { xmin: 740 }));
await sleep(4000);
await shot('/tmp/work/look.png');
