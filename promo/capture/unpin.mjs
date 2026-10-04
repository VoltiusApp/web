import { ensureSession, jsAsync, shot, sleep } from './wd.mjs';
await ensureSession();
console.log(await jsAsync(`
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  for (const c of useConnectionStore.getState().connections.filter(c => c.pinned)) await useConnectionStore.getState().updateConnection(c.id, { ...c, pinned: false });
  document.getElementById('promo-css').textContent = 'button[title*="Sync"],button[title="Business"]{visibility:hidden}';
  return useConnectionStore.getState().connections.filter(c => c.pinned).length;
`));
await sleep(2500);
await shot('/tmp/work/look.png');
