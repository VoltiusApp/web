import { ensureSession, jsAsync, js, sleep, shot, clickText } from './wd.mjs';
await ensureSession();
const code = process.argv[2];
if (code) console.log(JSON.stringify(await jsAsync(code), null, 1)?.slice(0, 4000));
if (process.argv[3]) { await sleep(+process.argv[3]); await shot('/tmp/work/look.png'); }
