import { ensureSession, jsAsync, keys, KEY, typeHuman, sleep } from './wd.mjs';
import { moveTo, clickOn, byCss, tabByText, idle, mark } from './mouse.mjs';

// Claude finishes by closing every tab but the culprit's: the local shell plus one.
const sessions = `const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions.length`;
await ensureSession();
await moveTo(640, 420, 200);
await idle(1800);
mark('toggle');
await clickOn(byCss, ['button[role="switch"]']);
await idle(1600);
await keys([KEY.Escape]);
await idle(900);
mark('claude');
await clickOn(byCss, ['.xterm-screen'], { fx: 0.5, fy: 0.5 });
await typeHuman('claude\n', { min: 70, max: 120 });
await idle(6000);
mark('prompt');
await typeHuman('Which prod host has a runaway process? Open a tab on it.', { min: 45, max: 90 });
await idle(600);
mark('enter');
await keys([KEY.Enter]);
let opened = false;
for (let i = 0; i < 600; i++) {
  const n = await jsAsync(sessions);
  if (n > 2) opened = true;
  if (opened && n === 2) break;
  await sleep(500);
}
mark('closed');
await idle(14000);
mark('answer');
await clickOn(tabByText, ['api-02']);
await idle(1500);
await clickOn(byCss, ['.xterm-screen'], { fx: 0.5, fy: 0.5 });
await typeHuman('top\n', { min: 70, max: 120 });
await idle(3500);
mark('end');
