import { ensureSession, jsAsync } from './wd.mjs';
await ensureSession();
console.log(await jsAsync(`
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  const names = ['bastion','jenkins','mail-01','vpn-gw','gitlab','minio'];
  for (const c of useConnectionStore.getState().connections.filter(c => names.includes(c.name))) await useConnectionStore.getState().deleteConnection(c.id);
  return useConnectionStore.getState().connections.length;
`));
