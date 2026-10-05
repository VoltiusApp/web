import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';

const BASE = 'http://localhost:4444';
const SIDF = '/tmp/work/sid';
const APP = process.env.WD_APP ?? '/tmp/work/voltius-bin';
const [WIN_W, WIN_H] = (process.env.WD_WIN ?? '1440x900').split('x').map(Number);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function http(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { raw: t }; }
}

export let sid = existsSync(SIDF) ? readFileSync(SIDF, 'utf8').trim() : null;

export async function ensureSession() {
  if (sid) {
    const r = await http('GET', `/session/${sid}/url`);
    if (r && r.value && !r.value.error) return sid;
  }
  const r = await http('POST', '/session', {
    capabilities: { alwaysMatch: { 'tauri:options': { application: APP } } },
  });
  sid = r.value.sessionId;
  writeFileSync(SIDF, sid);
  await sleep(6000);
  await setWindow(WIN_W, WIN_H);
  return sid;
}

export async function js(script, args = []) {
  const r = await http('POST', `/session/${sid}/execute/sync`, { script, args });
  return r && ('value' in r ? r.value : r);
}

export async function jsAsync(body, args = []) {
  const script = `var done=arguments[arguments.length-1]; (async()=>{${body}})().then(v=>done(v===undefined?null:v),e=>done('ERR '+(e&&e.stack||e)));`;
  const r = await http('POST', `/session/${sid}/execute/async`, { script, args });
  return r && ('value' in r ? r.value : r);
}

export async function setWindow(w, h) {
  return http('POST', `/session/${sid}/window/rect`, { width: w, height: h, x: 0, y: 0 });
}

export async function shot(path) {
  const r = await http('GET', `/session/${sid}/screenshot`);
  writeFileSync(path, Buffer.from(r.value, 'base64'));
}

export async function find(css) {
  const r = await http('POST', `/session/${sid}/element`, { using: 'css selector', value: css });
  const v = r && r.value;
  return v && !v.error ? v[Object.keys(v)[0]] : null;
}

export async function nativeClick(css) {
  const id = await find(css);
  if (!id) return 'NOEL';
  await http('POST', `/session/${sid}/element/${id}/click`, {});
  return 'OK';
}

export async function sendKeys(css, text) {
  const id = await find(css);
  if (!id) return 'NOEL';
  await http('POST', `/session/${sid}/element/${id}/value`, { text });
  return 'OK';
}

const KEY = { Enter: '', Escape: '', Control: '', Shift: '', Tab: '', Down: '', Up: '', Backspace: '' };
export { KEY };

export async function keys(seq) {
  const down = [], up = [];
  for (const k of seq) { down.push({ type: 'keyDown', value: k }); up.unshift({ type: 'keyUp', value: k }); }
  await http('POST', `/session/${sid}/actions`, { actions: [{ type: 'key', id: 'kb', actions: [...down, ...up] }] });
  await http('DELETE', `/session/${sid}/actions`);
}

export async function typeHuman(text, { min = 35, max = 85 } = {}) {
  for (const ch of text) {
    await keys([ch === '\n' ? KEY.Enter : ch]);
    await sleep(min + Math.random() * (max - min));
  }
}

export async function clickEl(css, idx = 0) {
  return js(
    `var els=[...document.querySelectorAll(arguments[0])].filter(e=>{var r=e.getBoundingClientRect();return r.width>0&&r.height>0;});
     var el=els[arguments[1]]; if(!el) return 'NOEL';
     var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
     ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(t=>el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:cx,clientY:cy,button:0})));
     return [cx,cy];`,
    [css, idx],
  );
}

export async function clickText(label, { tags = 'button,a,[role=button],[role=tab],[role=menuitem],div,span', maxw = 400 } = {}) {
  return js(
    `var needle=arguments[0];
     var el=[...document.querySelectorAll(arguments[1])].find(e=>{var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.width<arguments[2]&&e.textContent.trim()===needle;});
     if(!el) return 'NOEL';
     var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
     ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(t=>el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:cx,clientY:cy,button:0})));
     return [cx,cy];`,
    [label, tags, maxw],
  );
}

const T0 = Date.now();
export function mark(ev) {
  appendFileSync('/tmp/work/timeline.txt', `${((Date.now() - T0) / 1000).toFixed(2)} ${ev}\n`);
}

export async function clickRow(text, opts = {}) {
  for (let i = 0; i < 15; i++) { const r = await clickRowOnce(text, opts); if (r !== 'NOEL') return r; await sleep(200); }
  return 'NOEL';
}

async function clickRowOnce(text, { xmin = 0, xmax = 99999, ymin = 150 } = {}) {
  return js(
    `var t=arguments[0], a=arguments[1], b=arguments[2], ym=arguments[3];
     var els=[...document.querySelectorAll('*')].filter(e=>{var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=a&&r.left<b&&r.top>ym&&e.children.length===0&&e.textContent.trim()===t&&e.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));});
     if(!els.length) return 'NOEL';
     var el=els[0].closest('button,[role=button],[role=option],li,[tabindex]')||els[0].parentElement;
     el.click(); var r=el.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2];`,
    [text, xmin, xmax, ymin],
  );
}

export async function mouseAt(type, text, { xmin = 0, xmax = 99999, shift = false } = {}) {
  return js(
    `var t=arguments[0], a=arguments[1], b=arguments[2], kind=arguments[3], sh=arguments[4];
     var els=[...document.querySelectorAll('*')].filter(e=>{var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=a&&r.left<b&&e.children.length===0&&e.textContent.trim()===t&&e.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));});
     if(!els.length) return 'NOEL';
     var el=els[0], r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
     var o={bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,shiftKey:sh,ctrlKey:false};
     var seq = kind==='dbl' ? ['pointerdown','mousedown','pointerup','mouseup','click','pointerdown','mousedown','pointerup','mouseup','click','dblclick'] : ['pointerdown','mousedown','pointerup','mouseup','click'];
     seq.forEach((ev,i)=>el.dispatchEvent(new (ev.startsWith('pointer')?PointerEvent:MouseEvent)(ev,{...o,detail:ev==='dblclick'?2:(i>4?2:1)})));
     return [x,y];`,
    [text, xmin, xmax, type, shift],
  );
}
