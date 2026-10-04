import { ensureSession, setWindow, sleep, shot } from './wd.mjs';
await ensureSession(); await setWindow(1440, 900); await sleep(1500); await shot('/tmp/work/look.png');
