import { execSync } from 'child_process';
import { ensureSession, js, sleep } from './wd.mjs';
import { idle, mark } from './mouse.mjs';

await ensureSession();
await idle(4000);
mark('kill');
execSync('pkill -9 -x voltius');
mark('killed');
await fetch(`http://localhost:4444/session/${readSid()}`, { method: 'DELETE' }).catch(() => {});
await idle(1500);
mark('launch');
await ensureSession();
mark('window');
for (let i = 0; i < 120; i++) {
  if ((await js('return document.querySelectorAll(".xterm-screen").length')) >= 3) break;
  await sleep(250);
}
mark('restored');
await idle(6000);
mark('end');

function readSid() { return execSync('cat /tmp/work/sid').toString().trim(); }
