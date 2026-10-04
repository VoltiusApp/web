import { ensureSession, setWindow, shot, js, sleep } from './wd.mjs';
await ensureSession();
await setWindow(1440, 900);
await sleep(2500);
console.log(await js('return [document.readyState, document.body.innerHTML.length, innerWidth, innerHeight]'));
await shot('/tmp/work/boot.png');
