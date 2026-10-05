// Off camera: web-01, api-01 and db-01 connected and split into one tab.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { useSessionStore } = await import('/src/stores/sessionStore.ts');
const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
const { useLayoutStore } = await import('/src/stores/layoutStore.ts');
const { useUIStore } = await import('/src/stores/uiStore.ts');
useUIStore.getState().setTerminalFontSize(15);
const conns = useConnectionStore.getState().connections;
const ids = [];
for (const name of ['web-01', 'api-01', 'db-01']) ids.push(await useSessionStore.getState().connect(conns.find((c) => c.name === name).id));
useLayoutStore.getState().openSessions(ids);
useUIStore.getState().setActiveNav('terminal');
await sleep(6000);
return useSessionStore.getState().sessions.map((s) => [s.status, s.persist]);
