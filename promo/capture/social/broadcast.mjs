import { existsSync, rmSync } from 'fs';
import { ensureSession, js, keys, KEY, typeHuman, sleep } from './wd.mjs';
import { moveTo, clickCss, clickOn, byCss, idle, mark } from './mouse.mjs';

// The host side (broadcast.sh) drops done.flag once apt has finished on all twelve.
rmSync('/tmp/work/done.flag', { force: true });
await ensureSession();
await moveTo(1500, 1050, 200);
await idle(1500);
mark('select');
await keys([KEY.Control, 'a']);
await idle(1300);
mark('connect');
await clickCss('button[title="Connect (or double-click)"]');
for (let i = 0; i < 120; i++) {
  if ((await js(`return [...document.querySelectorAll('.xterm-rows')].filter(r=>/\\$ *$/.test(r.innerText.trim())).length`)) >= 12) break;
  await sleep(250);
}
mark('grid');
await idle(1500);
mark('broadcast');
await clickCss('button[title="Broadcast input"]');
await idle(900);
await clickOn(byCss, ['.xterm-screen'], { fx: 0.5, fy: 0.6 });
await idle(400);
mark('type');
await typeHuman('sudo apt update && sudo apt upgrade -y\n', { min: 60, max: 120 });
mark('enter');
while (!existsSync('/tmp/work/done.flag')) await idle(300);
await idle(2500);
mark('end');
