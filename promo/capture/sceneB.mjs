import { js, ensureSession, jsAsync, keys, KEY, typeHuman, sleep, mark } from './wd.mjs';
await ensureSession();
await sleep(1000);
mark('connect-many');
await jsAsync(`
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  const { useSessionStore } = await import('/src/stores/sessionStore.ts');
  const { useLayoutStore } = await import('/src/stores/layoutStore.ts');
  const byName = n => useConnectionStore.getState().connections.find(c => c.name === n).id;
  const ids = await useSessionStore.getState().connectMany(['web-01','web-02','db-primary','cache-01'].map(byName));
  useLayoutStore.getState().openSessions(ids);
  const { activateSplitTabPane } = await import('/src/services/tabActivation.ts');
  const L = useLayoutStore.getState(); activateSplitTabPane(L.splitTabs[L.splitTabs.length-1].id);
`);
await sleep(4500);
mark('broadcast-on');
await jsAsync(`const { useLayoutStore } = await import('/src/stores/layoutStore.ts'); useLayoutStore.getState().toggleBroadcast();`);
await sleep(400);
await js(`document.querySelector('.xterm-helper-textarea')?.focus()`);
await sleep(800);
mark('type-htop');
await typeHuman('htop\n', { min: 110, max: 180 });
await sleep(4000);
for (const th of ['tokyo-night', 'dracula', 'nord', 'monokai', 'voltius']) {
  mark('theme ' + th);
  await jsAsync(`const { useThemeStore } = await import('/src/stores/themeStore.ts'); useThemeStore.getState().setTheme(arguments[0]);`, [th]);
  await sleep(1600);
}
mark('end');
