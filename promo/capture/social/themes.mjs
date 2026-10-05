import { ensureSession } from './wd.mjs';
import { moveTo, clickText, idle, mark } from './mouse.mjs';

const ORDER = ['Dracula', 'Nord', 'Monokai', 'Tokyo Night', 'Voltius Light', 'Voltius'];
await ensureSession();
await moveTo(1130, 120, 200);
await idle(1500);
for (const [i, name] of ORDER.entries()) {
  mark(`theme${i}`);
  await clickText(name, { ms: 380 });
  await idle(1300);
}
mark('end');
