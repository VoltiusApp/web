import { ensureSession } from './wd.mjs';
import { moveTo, clickOn, clickText, dblclickText, byText, waitRect, wheel, idle, mark, waitFor } from './mouse.mjs';
import { UI } from './ui.mjs';

const LABEL = { termius: 'Termius', mobaxterm: 'MobaXterm', putty: 'PuTTY', securecrt: 'SecureCRT', zoc: 'ZOC Terminal', csv: 'CSV' };
const source = process.argv[2];
const reviewButton = `return [...document.querySelectorAll('button')].find(b=>/^Review \\d+ items$/.test(b.textContent.trim()));`;

await ensureSession();
await moveTo(760, 560, 200);
await idle(1300);
mark('menu');
await clickOn(...UI.importMenu);
await idle(1000);
mark('source');
await clickText(`From ${LABEL[source]}`);
if (source === 'csv') {
  await idle(1100);
  mark('paste');
  await clickText('Paste from Clipboard');
  await idle(1500);
  await clickOn(reviewButton);
}
await waitRect(byText, ['Review import']);
mark('review');
await idle(900);
await wheel(3, 640, 500);
await idle(900);
mark('import');
await clickOn(...UI.importConfirm);
await waitFor(`return ![...document.querySelectorAll('button')].some(b=>/Importing/.test(b.textContent))`, [], 60000);
mark('imported');
await idle(900);
await clickOn(...UI.modalClose);
mark('grid');
await idle(1400);
if (['termius', 'securecrt', 'zoc'].includes(source) && process.argv[3] !== 'flat') {
  mark('folder');
  await dblclickText('Production');
}
await moveTo(900, 720);
await idle(2600);
mark('end');
