import { ensureSession, jsAsync, shot, sleep } from './wd.mjs';
await ensureSession();
console.log(await jsAsync(`
  const { useFolderStore } = await import('/src/stores/folderStore.ts');
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  const { storeSecret } = await import('/src/services/vault.ts');
  const prod = useFolderStore.getState().folders.find(f => f.name === 'Production');
  const victims = useConnectionStore.getState().connections.filter(c => c.folder_id === prod.id);
  for (const c of victims) await useConnectionStore.getState().deleteConnection(c.id);
  await useFolderStore.getState().deleteFolder(prod.id, { cascade: false });
  for (const c of victims) {
    const n = await useConnectionStore.getState().saveConnection({ name: c.name, host: c.host, port: 2222, username: 'deploy', auth_type: 'password', tags: c.tags, icon: c.icon, distro: 'alpine', pinned: true });
    await storeSecret('password:' + n.id, 'deploy');
  }
  if (!document.getElementById('promo-css')) { const s = document.createElement('style'); s.id = 'promo-css'; s.textContent = 'button[title^="Sync error"],button[title="Business"]{visibility:hidden}'; document.head.appendChild(s); }
  return useConnectionStore.getState().connections.length;
`));
await sleep(2500);
await shot('/tmp/work/look.png');
