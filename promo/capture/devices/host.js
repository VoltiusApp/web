const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
const { useSessionStore } = await import('/src/stores/sessionStore.ts');
const { useUIStore } = await import('/src/stores/uiStore.ts');
let c = useConnectionStore.getState().connections.find((x) => x.name === 'web-01');
if (!c) c = await useConnectionStore.getState().saveConnection({ name: 'web-01', host: 'web-01.acme.io', port: 2222, username: 'deploy', auth_type: 'password', tags: ['prod'], distro: 'ubuntu' });
for (const s of [...useSessionStore.getState().sessions]) { try { await useSessionStore.getState().disconnect(s.id); } catch {} useSessionStore.getState().removeSession(s.id); }
useUIStore.getState().setTerminalFontSize(16);
const id = await useSessionStore.getState().connect(c.id).catch(() => null);
await sleep(5000);
const pw = document.querySelector('input[type=password]');
if (pw) {
  setVal(pw, 'deploy'); await sleep(300);
  [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Connect & Save').click();
  await sleep(7000);
}
const tab = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === 'web-01' && e.getBoundingClientRect().top < 50);
tab?.click(); await sleep(1500);
const css = document.getElementById('promo-css') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'promo-css' }));
css.textContent = 'button[title*="Sync"],button[title="Business"],[data-promo-hide]{visibility:hidden!important}';
const cpu = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /^CPU/.test(e.textContent.trim()));
cpu?.parentElement.setAttribute('data-promo-hide', '1');
return JSON.stringify(useSessionStore.getState().sessions.map((s) => [s.status, s.persist]));
