import { ensureSession, jsAsync, keys, KEY, sleep, clickText, clickEl, shot } from './wd.mjs';
await ensureSession();
console.log(await jsAsync(`
  const { useSessionStore } = await import('/src/stores/sessionStore.ts');
  const { useUIStore } = await import('/src/stores/uiStore.ts');
  const { useThemeStore } = await import('/src/stores/themeStore.ts');
  for (const s of [...useSessionStore.getState().sessions]) { try { await useSessionStore.getState().disconnect(s.id); } catch {} useSessionStore.getState().removeSession(s.id); }
  useUIStore.getState().setTerminalFontSize(15);
  useThemeStore.getState().setTheme('voltius');
  if (!document.getElementById('promo-css')) { const s = document.createElement('style'); s.id = 'promo-css'; document.head.appendChild(s); }
  document.getElementById('promo-css').textContent = 'button[title*="Sync"],button[title="Business"]{visibility:hidden}';
  return useSessionStore.getState().sessions.length;
`));
await sleep(800);
await keys([KEY.Escape]);
await sleep(400);
console.log(await clickText('Vaults'));
await sleep(600);
console.log(await clickEl('[data-testid="vault-button-personal"]'));
await sleep(600);
console.log(await clickText('Hosts'));
await sleep(800);
await shot('/tmp/work/look.png');
