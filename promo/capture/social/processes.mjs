import { readFileSync } from 'fs';
import { ensureSession } from './wd.mjs';
import { moveTo, clickOn, clickCss, byText, idle, mark } from './mouse.mjs';
import { UI } from './ui.mjs';

const pid = readFileSync('/tmp/work/pid.txt', 'utf8').trim();
await ensureSession();
await moveTo(600, 420, 200);
await idle(1600);
mark('panel');
await clickCss('button[title="Processes"]');
await idle(2600);
mark('kill');
await clickOn(...UI.rowButton('report-worker', `Kill process ${pid}`));
await idle(1100);
mark('confirm');
await clickOn(byText, ['Kill']);
await idle(3500);
mark('end');
