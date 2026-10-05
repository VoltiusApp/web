// Off camera: the side panel open on its Themes tab.
import { ensureSession, jsAsync, js, sleep } from './wd.mjs';
await ensureSession();
await jsAsync(`const { useUIStore } = await import('/src/stores/uiStore.ts'); useUIStore.getState().setRightPanelOpen(true); useUIStore.getState().setRightPanelSection('themes');`);
await sleep(1500);
console.log('panel', await js(`var b=[...document.querySelectorAll('p')].find(e=>e.textContent.trim()==='Dracula'); return !!b && b.getBoundingClientRect().right <= innerWidth`));
