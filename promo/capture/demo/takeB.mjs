import { ensureSession } from './wd.mjs';
import { moveTo, clickOn, waitRect, dragTo, idle, mark, waitFor } from './mouse.mjs';
import { UI, LEFT, RIGHT } from './ui.mjs';

const FILE = 'release-v2.5.0.tar.gz';

await ensureSession();
await idle(600);
mark('sftp');
await clickOn(...UI.sftpButton);
await idle(1300);
mark('drag');
const src = await waitRect(...UI.file(FILE, LEFT));
const last = await waitRect(...UI.file('release-v2.4.1.tar.gz', RIGHT));
await dragTo([src[0], src[1]], [last[0] + 120, last[1] + 140], 1100);
mark('dropped');
await waitFor(`return [...document.querySelectorAll('*')].some(e=>{var r=e.getBoundingClientRect(); return e.children.length===0&&e.textContent.trim()===arguments[0]&&r.left>=640&&r.top>180&&r.top<700;})`, [FILE], 20000);
mark('landed');
await idle(400);
await moveTo(1000, 600, 700);
await idle(2500);
mark('end');
