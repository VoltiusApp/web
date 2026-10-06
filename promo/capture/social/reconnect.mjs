import { existsSync, rmSync } from 'fs';
import { ensureSession, typeHuman } from './wd.mjs';
import { clickOn, byCss, moveTo, idle, mark } from './mouse.mjs';

// The host side (reconnect.sh) pauses web-02 mid-build, unpauses it and drops back.flag once the session is live again.
rmSync('/tmp/work/back.flag', { force: true });
await ensureSession();
await clickOn(byCss, ['.xterm-screen'], { fx: 0.5, fy: 0.8 });
await idle(1200);
mark('build');
await typeHuman('./build.sh\n', { min: 60, max: 110 });
await moveTo(900, 600, 800);
while (!existsSync('/tmp/work/back.flag')) await idle(300);
await idle(5000);
mark('end');
