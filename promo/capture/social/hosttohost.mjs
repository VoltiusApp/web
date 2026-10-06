import { ensureSession, js, jsAsync } from './wd.mjs';
import { moveTo, waitRect, dragTo, clickText, idle, mark } from './mouse.mjs';
import { UI, LEFT } from './ui.mjs';

await ensureSession();
await moveTo(300, 560, 200);
await idle(1500);
mark('drag');
const src = await waitRect(...UI.file('site-v2.6.0', LEFT));
await dragTo([src[0], src[1]], [960, 420], 1100);
mark('dropped');
await idle(1500);
if (await js(`var h=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='Transfers'); return !!h && h.getBoundingClientRect().top > innerHeight - 40`)) {
  mark('queue');
  await clickText('Transfers');
}
await moveTo(1100, 740, 700);
const running = `const { useTransferQueueStore: q } = await import("/src/stores/transferQueueStore.ts"); return q.getState().transfers.some((t) => t.status === "running")`;
while ((await jsAsync(running)) === true) await idle(300);
mark('done');
await idle(1500);
await moveTo(960, 300, 800);
await idle(1800);
mark('end');
