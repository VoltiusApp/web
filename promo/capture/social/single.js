// Off camera: one web-01 terminal tab, nothing else open, default theme.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { useSessionStore } = await import('/src/stores/sessionStore.ts');
const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
const { useUIStore } = await import('/src/stores/uiStore.ts');
const { useThemeStore } = await import('/src/stores/themeStore.ts');
useThemeStore.getState().setTheme('voltius');
useUIStore.getState().setTerminalFontSize(16);
useUIStore.getState().setSftpPanelOpen(false);
useUIStore.getState().setRightPanelOpen(false);
await useSessionStore.getState().connect(useConnectionStore.getState().connections.find((c) => c.name === 'web-01').id);
useUIStore.getState().setActiveNav('terminal');
await sleep(5000);
return useSessionStore.getState().sessions.map((s) => s.status);
