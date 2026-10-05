import { execFileSync } from 'child_process';
import { readFileSync, appendFileSync } from 'fs';
import { js, sleep } from './wd.mjs';

const [D, X] = readFileSync('/tmp/work/disp', 'utf8').trim().split(/\s+/);
const env = { ...process.env, DISPLAY: D, XAUTHORITY: X };
const xdo = (...a) => execFileSync('xdotool', a.map(String), { env });
const now = () => Date.now() / 1000;
const log = (kind, x, y) => appendFileSync('/tmp/work/cursor.txt', `${now().toFixed(3)} ${kind} ${Math.round(x)} ${Math.round(y)}\n`);

export const idle = sleep;
export function mark(ev) { appendFileSync('/tmp/work/marks.txt', `${now().toFixed(3)} ${ev}\n`); }

export let pos = (() => { const o = xdo('getmouselocation', '--shell').toString(); return { x: +/X=(\d+)/.exec(o)[1], y: +/Y=(\d+)/.exec(o)[1] }; })();
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function moveTo(x, y, ms) {
  const d = Math.hypot(x - pos.x, y - pos.y);
  const dur = ms ?? Math.min(1300, 400 + d * 1.1);
  const sx = pos.x, sy = pos.y, t0 = Date.now();
  const bend = (Math.random() - 0.5) * Math.min(80, d * 0.15);
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / dur), e = ease(t);
    const nx = sx + (x - sx) * e - (y - sy) / (d || 1) * bend * Math.sin(Math.PI * e);
    const ny = sy + (y - sy) * e + (x - sx) / (d || 1) * bend * Math.sin(Math.PI * e);
    xdo('mousemove', Math.round(nx), Math.round(ny));
    log('m', nx, ny);
    if (t >= 1) break;
    await sleep(12);
  }
  pos = { x, y };
}

export async function down() { xdo('mousedown', 1); log('d', pos.x, pos.y); }
export async function up() { xdo('mouseup', 1); log('u', pos.x, pos.y); }
export async function click(x, y, ms) {
  if (x != null) await moveTo(x, y, ms);
  await sleep(120);
  await down(); await sleep(90); await up();
}

export async function dblclick(x, y, ms) {
  if (x != null) await moveTo(x, y, ms);
  await sleep(120);
  await down(); await sleep(60); await up(); await sleep(90);
  await down(); await sleep(60); await up();
}

// Press, nudge past the app's drag threshold, glide, release.
export async function dragTo([x1, y1], [x2, y2], ms = 1000) {
  await moveTo(x1, y1);
  await idle(200);
  await down(); await sleep(250);
  await moveTo(x1 + 14, y1 + 8, 140);
  await moveTo(x2, y2, ms);
  await idle(450);
  await up();
}

export async function wheel(n, x, y) {
  if (x != null) await moveTo(x, y);
  for (let i = 0; i < Math.abs(n); i++) { xdo('click', n > 0 ? 5 : 4); await sleep(70); }
}

const VISIBLE = `function vis(e){var r=e.getBoundingClientRect(); return r.width>0&&r.height>0;}
  function inX(e,a,b){var r=e.getBoundingClientRect(); return r.left>=a&&r.left<b;}`;

export const byText = `${VISIBLE} var t=arguments[0], a=arguments[1]||0, b=arguments[2]||1e5;
  var c=[...document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],[role=option],div,span,li,p')].filter(e=>{var r=e.getBoundingClientRect(); return vis(e)&&inX(e,a,b)&&e.textContent.trim()===t&&(function(p){return p&&(e.contains(p)||p.contains(e));})(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));});
  c.sort((x,y)=>x.getBoundingClientRect().width*x.getBoundingClientRect().height-y.getBoundingClientRect().width*y.getBoundingClientRect().height);
  return c[0];`;
export const byCss = `${VISIBLE} var a=arguments[1]||0, b=arguments[2]||1e5; return [...document.querySelectorAll(arguments[0])].find(e=>vis(e)&&inX(e,a,b));`;
export const tabByText = `return [...document.querySelectorAll('*')].find(e=>{var r=e.getBoundingClientRect(); return r.top<60&&r.width>0&&e.children.length===0&&e.textContent.trim()===arguments[0];});`;

export async function rectOf(finder, args = []) {
  return js(`var el=(function(){${finder}}).apply(null, arguments); if(!el) return null; var r=el.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, r.width, r.height, r.left, r.top];`, args);
}

export async function waitRect(finder, args = [], tries = 40) {
  for (let i = 0; i < tries; i++) { const r = await rectOf(finder, args); if (r) return r; await sleep(150); }
  throw new Error('not found: ' + JSON.stringify(args) + ' ' + finder.slice(0, 120));
}

// Point inside an element as fractions of its box.
export const at = (r, fx, fy) => [r[4] + r[2] * fx, r[5] + r[3] * fy];

export async function clickOn(finder, args = [], { fx = 0.5, fy = 0.5, ms } = {}) {
  const r = await waitRect(finder, args);
  await click(...at(r, fx, fy), ms);
  return r;
}
export const clickText = (t, o) => clickOn(byText, [t], o);
export async function dblclickText(t) {
  const r = await waitRect(byText, [t]);
  await dblclick(r[0], r[1]);
}
export const clickCss = (css, o) => clickOn(byCss, [css], o);

export async function waitFor(cond, args = [], ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await js(cond, args)) return true; await sleep(150); }
  return false;
}
