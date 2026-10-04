import { ensureSession, sleep, mouseAt, clickRow, js, clickText, typeHuman, mark } from './wd.mjs';
await ensureSession();
const chip = (x) => js(`var b=document.elementFromPoint(arguments[0],96); (b.closest('button')||b).click(); return 1`, [x]);
await sleep(800);
mark('sftp-tab');
await clickText('SFTP');
await sleep(1000);
if (await js(`return !![...document.querySelectorAll('input[placeholder="Filter hosts..."]')].find(e=>e.getBoundingClientRect().left<700&&e.getBoundingClientRect().width>0)`) !== true) { await chip(85); await sleep(900); }
mark('pick-local');
console.log('local', await clickRow('Local Machine', { xmax: 700 }));
await sleep(1000);
if (await js(`return !![...document.querySelectorAll('input[placeholder="Filter hosts..."]')].find(e=>e.getBoundingClientRect().left>740&&e.getBoundingClientRect().width>0)`) !== true) { await chip(805); await sleep(900); }
await js(`var i=[...document.querySelectorAll('input[placeholder="Filter hosts..."]')].find(e=>e.getBoundingClientRect().left>740); i.focus(); return 1`);
mark('filter');
await typeHuman('web', { min: 90, max: 150 });
await sleep(500);
mark('pick-remote');
console.log('remote', await clickRow('web-01', { xmin: 740 }));
await sleep(2500);
mark('nav');
await mouseAt('dbl', 'backups', { xmin: 740 });
await sleep(900);
await mouseAt('dbl', 'Projects', { xmax: 700 });
await sleep(800);
await mouseAt('dbl', 'acme-api', { xmax: 700 });
await sleep(1000);
mark('select');
await mouseAt('click', 'db-2026-10-01.sql.gz', { xmin: 740 });
await sleep(400);
await mouseAt('click', 'db-2026-10-03.sql.gz', { xmin: 740, shift: true });
await sleep(900);
mark('transfer');
await js(`var b=document.elementFromPoint(720,481); (b.closest('button')||b).click(); return 1`);
await sleep(700);
console.log('expand', await clickText('Transfers'));
for (let i = 0; i < 160; i++) { const n = await js(`return [...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/^db-2026-10-0\\d\\.sql\\.gz$/.test(e.textContent.trim())&&e.getBoundingClientRect().left<700&&e.getBoundingClientRect().width>0).length`); if (n >= 3) break; await sleep(250); }
mark('done');
await sleep(3000);
mark('end');
