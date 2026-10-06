// One step of a two-instance take, run in either container: node act.mjs <verb> [arg]. Pointer moves are real (xdotool) and logged.
import { ensureSession, keys, KEY, typeHuman, jsAsync, sleep } from './wd.mjs';
import { moveTo, clickOn, byText, byCss, idle, mark } from './mouse.mjs';

const [verb, arg] = process.argv.slice(2);
await ensureSession();
const startsWith = `[...document.querySelectorAll('button')].find((b) => b.getBoundingClientRect().width > 0 && b.textContent.trim().startsWith(arguments[0]))`;
const exact = `[...document.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0 && b.textContent.trim() === arguments[0]).pop()`;
const starts = `return ${startsWith};`;
const lastText = `return ${exact};`;
switch (verb) {
  case 'text': await clickOn(byText, [arg], { ms: 650 }); break;
  case 'last': await clickOn(lastText, [arg], { ms: 650 }); break;
  case 'starts': await clickOn(starts, [arg], { ms: 650 }); break;
  case 'css': await clickOn(byCss, [arg], { ms: 650 }); break;
  case 'term': await clickOn(byCss, ['.xterm-screen'], { fx: 0.45, fy: 0.85, ms: 650 }); break;
  case 'type': await typeHuman(arg.replace(/\\n/g, '\n'), { min: 55, max: 110 }); break;
  case 'esc': await keys([KEY.Escape]); break;
  case 'move': { const [x, y] = arg.split(',').map(Number); await moveTo(x, y, 700); break; }
  case 'wait': for (let i = 0; i < 100 && !(await jsAsync(`return !!${arg.startsWith('@') ? startsWith : exact};`, [arg])); i++) await sleep(200); break;
  case 'mark': mark(arg); break;
  case 'idle': await idle(+arg); break;
  default: throw new Error('act: unknown verb ' + verb);
}
