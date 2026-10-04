import { ensureSession, shot, js, clickText, clickEl, sleep } from './wd.mjs';
await ensureSession();
const [action, arg] = process.argv.slice(2);
if (action === 'text') console.log(await clickText(arg));
if (action === 'css') console.log(await clickEl(arg));
if (action === 'js') console.log(await js(arg));
await sleep(1500);
await shot('/tmp/work/look.png');
