import { ensureSession, jsAsync, typeHuman, sleep } from './wd.mjs';
import { moveTo, dblclickText, idle, mark } from './mouse.mjs';

const live = `const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions.filter((x) => x.status === 'connected').length`;
await ensureSession();
await moveTo(700, 500, 200);
await idle(1600);
mark('open');
await dblclickText('router');
for (let i = 0; i < 80 && (await jsAsync(live)) < 1; i++) await sleep(200);
mark('shell');
await idle(1800);
await typeHuman('base64 --help || echo "no base64 here"\n', { min: 50, max: 100 });
await idle(1500);
mark('nob64');
await typeHuman('cat /etc/openwrt_version\n', { min: 50, max: 100 });
await idle(2500);
mark('end');
