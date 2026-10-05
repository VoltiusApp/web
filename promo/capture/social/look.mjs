import { ensureSession, js, shot } from './wd.mjs';
await ensureSession();
await shot('/tmp/work/look.png');
console.log(JSON.stringify(await js(`return [...document.querySelectorAll('button,input,[role=button]')].filter(e=>{var r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).map(e=>{var r=e.getBoundingClientRect();return [e.tagName[0], (e.title||e.placeholder||e.textContent.trim()).slice(0,40), Math.round(r.left+r.width/2), Math.round(r.top+r.height/2)];})`)));
