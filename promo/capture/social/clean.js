const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
const { useFolderStore } = await import('/src/stores/folderStore.ts');
const { useKnownHostStore } = await import('/src/stores/knownHostStore.ts');
for (const c of [...useConnectionStore.getState().connections]) await useConnectionStore.getState().deleteConnection(c.id);
for (const f of [...useFolderStore.getState().folders]) { try { await useFolderStore.getState().deleteFolder(f.id, { cascade: true }); } catch {} }
const { useSnippetStore } = await import('/src/stores/snippetStore.ts');
const { useIdentityStore } = await import('/src/stores/identityStore.ts');
const sn = useSnippetStore.getState(); for (const x of [...(sn.snippets || [])]) { try { await sn.deleteSnippet(x.id); } catch {} }
const idn = useIdentityStore.getState(); for (const x of [...(idn.identities || [])]) { try { await idn.deleteIdentity(x.id); } catch {} }
const kh = useKnownHostStore.getState(); await kh.loadKnownHosts();
for (const k of [...useKnownHostStore.getState().knownHosts]) await kh.removeKnownHost(k.id);
if (!document.getElementById('promo-css')) document.head.appendChild(Object.assign(document.createElement('style'), { id: 'promo-css' }));
return [useConnectionStore.getState().connections.length, useFolderStore.getState().folders.length, (useSnippetStore.getState().snippets || []).length, (useIdentityStore.getState().identities || []).length];
