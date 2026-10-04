import { ensureSession, jsAsync, js, keys, KEY, sleep, setWindow, shot } from './wd.mjs';
await ensureSession();
await setWindow(1280, 800);
await js('location.reload(); return 1');
await sleep(3000);
for (let i = 0; i < 120; i++) { const t = await js('return document.body.innerText'); if (t && !/Checking vault|Loading connections|Initializing app/.test(t) && t.length > 50) break; await sleep(500); }
await sleep(4000);
console.log(await jsAsync(`
  const { useSessionStore } = await import('/src/stores/sessionStore.ts');
  const { useUIStore } = await import('/src/stores/uiStore.ts');
  const { useThemeStore } = await import('/src/stores/themeStore.ts');
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  const { useFolderStore } = await import('/src/stores/folderStore.ts');
  const { useSnippetStore } = await import('/src/stores/snippetStore.ts');
  const { useIdentityStore } = await import('/src/stores/identityStore.ts');
  for (const s of [...useSessionStore.getState().sessions]) { try { await useSessionStore.getState().disconnect(s.id); } catch {} useSessionStore.getState().removeSession(s.id); }
  for (const c of [...useConnectionStore.getState().connections]) await useConnectionStore.getState().deleteConnection(c.id);
  for (const f of [...useFolderStore.getState().folders]) { try { await useFolderStore.getState().deleteFolder(f.id, { cascade: true }); } catch (e) {} }
  const sn = useSnippetStore.getState(); for (const s of [...(sn.snippets || [])]) { try { await sn.deleteSnippet(s.id); } catch (e) {} }
  const idn = useIdentityStore.getState(); for (const i of [...(idn.identities || [])]) { try { await idn.deleteIdentity(i.id); } catch (e) {} }
  const ui = useUIStore.getState();
  ui.setTerminalFontSize(14); ui.setSftpPanelOpen(false); ui.setHomeView(false); ui.setRightPanelOpen(false); ui.setRightPanelSection('snippets');
  useThemeStore.getState().setTheme('voltius');
  if (!document.getElementById('promo-css')) { const s = document.createElement('style'); s.id = 'promo-css'; document.head.appendChild(s); }
  document.getElementById('promo-css').textContent = 'button[title*="Sync"],button[title="Business"]{visibility:hidden}';
  return [useConnectionStore.getState().connections.length, useFolderStore.getState().folders.length, (useSnippetStore.getState().snippets||[]).length, (useIdentityStore.getState().identities||[]).length];
`));
await sleep(500);
await keys([KEY.Escape]);
await sleep(1500);
await shot('/tmp/work/look.png');
