// Off camera: side panel shut, the Personal vault's Hosts page in front.
const { useUIStore: u } = await import('/src/stores/uiStore.ts');
u.getState().setRightPanelOpen(false);
u.getState().setActiveNav('hosts');
document.querySelector('button')?.click();
await new Promise((r) => setTimeout(r, 1200));
[...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Personal') && b.textContent.includes('hosts'))?.click();
return 1;
