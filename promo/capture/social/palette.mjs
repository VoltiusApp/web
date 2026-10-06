import { ensureSession, jsAsync, keys, KEY, typeHuman, sleep } from './wd.mjs';
import { moveTo, idle, mark } from './mouse.mjs';

const live = `const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions.filter((x) => x.status === 'connected').length`;
await ensureSession();
await moveTo(1180, 700, 200);
await idle(1800);
for (const [i, host] of ['db-01', 'api-03', 'cache-01'].entries()) {
  mark(`k${i}`);
  await keys([KEY.Control, 'k']);
  await idle(600);
  await typeHuman(host, { min: 70, max: 130 });
  mark(`typed${i}`);
  await idle(500);
  await keys([KEY.Enter]);
  for (let t = 0; t < 80 && (await jsAsync(live)) < i + 1; t++) await sleep(200);
  mark(`open${i}`);
  await idle(1800);
}
mark('end');
