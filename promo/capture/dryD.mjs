import { ensureSession, jsAsync, js, sleep, shot, clickText } from './wd.mjs';
await ensureSession();
await jsAsync(`const { useUIStore } = await import('/src/stores/uiStore.ts'); useUIStore.getState().openImportExport('import');`);
await sleep(1000);
await clickText('PuTTY');
await sleep(800);
console.log(await js("var b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Extract from')); b.click(); return 1"));
await sleep(2500);
await shot('/tmp/work/d1.png');
