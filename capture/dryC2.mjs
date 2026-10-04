import { ensureSession, sleep, shot, js, clickRow, typeHuman } from './wd.mjs';
await ensureSession();
console.log(await js(`var i=[...document.querySelectorAll('input[placeholder="Filter hosts..."]')].find(e=>e.getBoundingClientRect().left>740); i.focus(); return !!i`));
await typeHuman('web-01');
await sleep(800);
console.log(await js(`return [...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()==='web-01').map(e=>{var r=e.getBoundingClientRect();return e.tagName+':'+Math.round(r.left)+','+Math.round(r.top)+':'+(e.closest('button,[role=button],[role=option],li,[tabindex]')||{}).tagName})`));
await shot('/tmp/work/look.png');
