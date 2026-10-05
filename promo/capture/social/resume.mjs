import { existsSync, rmSync } from 'fs';
import { ensureSession, js } from './wd.mjs';
import { moveTo, waitRect, dragTo, clickText, idle, mark } from './mouse.mjs';
import { UI, LEFT, RIGHT } from './ui.mjs';

// The host side (resume.sh) cuts and restores the link and drops done.flag when the copy has finished.
rmSync('/tmp/work/done.flag', { force: true });
await ensureSession();
await moveTo(300, 560, 200);
await idle(1500);
mark('drag');
const src = await waitRect(...UI.file('backup-2026-10', LEFT));
await dragTo([src[0], src[1]], [960, 420], 1100);
mark('dropped');
await idle(2500);
// The queue keeps its own collapsed state; collapsed, its header sits on the bottom edge.
if (await js(`var h=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Transfers'); return !!h && h.getBoundingClientRect().top > innerHeight - 40`)) {
  mark('queue');
  await clickText('Transfers');
}
await moveTo(900, 640, 900);
while (!existsSync('/tmp/work/done.flag')) await idle(300);
await idle(3000);
mark('end');
