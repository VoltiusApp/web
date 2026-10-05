import { ensureSession } from './wd.mjs';
import { moveTo, clickText, idle, mark } from './mouse.mjs';

await ensureSession();
await moveTo(900, 640, 200);
await idle(1500);
mark('choose');
await clickText('Get started');
mark('started');
await idle(3500);
mark('end');
