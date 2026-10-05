import { ensureSession, sleep, shot, js, jsAsync, typeHuman, mouseAt, clickRow } from './wd.mjs';
import { moveTo, pos, rectOf } from './mouse.mjs';
import { UI, LEFT, RIGHT } from './ui.mjs';

// Off-camera: SFTP tab with the local dataset on the left and web-01's home on the right.
await ensureSession();
const back = { ...pos };
const tap = async ([finder, args]) => {
  const r = await rectOf(finder, args);
  if (!r) throw new Error('prep: target missing ' + finder.slice(0, 80));
  await js(`var b=document.elementFromPoint(arguments[0],arguments[1]); (b.closest('button')||b).click(); return 1`, [r[0], r[1]]);
};

async function pick(side, host) {
  if (!(await rectOf(...UI.hostPicker(side)))) { await tap(UI.hostChip(side)); await sleep(1200); }
  const [finder, args] = UI.hostPicker(side);
  await js(`var el=(function(){${finder}}).apply(null, arguments); el.focus(); return 1`, args);
  await typeHuman(host); await sleep(700);
  console.log('pick', host, await clickRow(host, { xmin: side[0], xmax: side[1] }));
  await sleep(3000);
}

async function open(side, dirs) {
  await tap(UI.homeDir(side)); await sleep(1200);
  for (const d of dirs) { console.log('cd', d, await mouseAt('dbl', d, { xmin: side[0], xmax: side[1] })); await sleep(1100); }
}

await jsAsync(`const { useUIStore } = await import('/src/stores/uiStore.ts'); useUIStore.getState().setSftpPanelOpen(false); await new Promise((r) => setTimeout(r, 300)); useUIStore.getState().setSftpPanelOpen(true);`);
await sleep(2500);
await pick(LEFT, 'Local Machine');
await open(LEFT, ['datasets']);
await pick(RIGHT, 'web-01');
await open(RIGHT, []);
await js(`window.getSelection().removeAllRanges(); return 1`);
await shot('/tmp/work/sftp_prep.png');
await sleep(1500);
await moveTo(back.x, back.y, 1);
