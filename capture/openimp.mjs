import { ensureSession, jsAsync, shot, sleep } from './wd.mjs';
await ensureSession();
await jsAsync(`const { useUIStore } = await import('/src/stores/uiStore.ts'); useUIStore.getState().openImportExport('import');`);
await sleep(1500);
await shot('/tmp/work/look.png');
