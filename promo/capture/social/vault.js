const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (f, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(200); } return null; };
const ready = await until(() => !/Checking vault|Initializing|Loading connections/.test(document.body.innerText) && document.querySelector('button[title="Personal"]'));
if (!ready) return 'not ready';
await sleep(1500);
document.scrollingElement.scrollTop = 0;
document.querySelector('button[title="Personal"]').click();
return (await until(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Import/Export'), 10000)) ? 'vault open' : 'no hosts page';
