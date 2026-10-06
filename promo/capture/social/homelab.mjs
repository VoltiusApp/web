import { ensureSession, jsAsync, typeHuman, sleep } from './wd.mjs';
import { moveTo, clickOn, clickCss, idle, mark, tabByText } from './mouse.mjs';
import { UI } from './ui.mjs';

// xterm draws to a canvas, so readiness comes from the session store: one more session, connected.
const live = `const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions.filter((x) => x.status === 'connected').length`;
const opened = async (before) => { for (let i = 0; i < 80 && (await jsAsync(live)) <= before; i++) await sleep(200); await idle(900); };

await ensureSession();
await moveTo(700, 420, 200);
await idle(1800);
mark('shell');
let n = await jsAsync(live);
await clickOn(...UI.rowButton('pihole', 'Open shell'));
await opened(n);
mark('lxc');
await idle(700);
await typeHuman('hostname && id -un\n', { min: 55, max: 110 });
await idle(1800);
mark('docker');
await clickOn(tabByText, ['docker-01']);
await idle(900);
await clickCss('button[title="Docker"]');
await idle(1600);
mark('exec');
n = await jsAsync(live);
await clickOn(...UI.rowButton('proxy', 'Open terminal'));
await opened(n);
mark('ct');
await idle(700);
await typeHuman('nginx -v && ps\n', { min: 60, max: 110 });
await idle(2500);
mark('end');
