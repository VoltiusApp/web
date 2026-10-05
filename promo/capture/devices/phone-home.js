const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { useSessionStore } = await import('/src/stores/sessionStore.ts');
const hosts = () => [...document.querySelectorAll('button,a,[role=tab]')].find((e) => e.textContent.trim() === 'Hosts')?.click();
for (const s of [...useSessionStore.getState().sessions]) { try { await useSessionStore.getState().disconnect(s.id); } catch {} useSessionStore.getState().removeSession(s.id); }
hosts(); await sleep(2500);
const want = arguments[0];
for (const card of [...document.querySelectorAll('[data-mobile-remote-session]')]) {
  if (card.textContent.includes(want)) continue;
  card.click(); await sleep(8000);
  for (const s of [...useSessionStore.getState().sessions]) useSessionStore.getState().removeSession(s.id);
  hosts(); await sleep(2500);
}
return document.body.innerText.replace(/\n+/g, ' | ').slice(0, 200);
