const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
const btn = (t) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim().includes(t)).pop();
const [server, email, password] = arguments[0].split(' ');
const cloud = btn('Cloud account');
if (!cloud) return 'already signed in';
cloud.click(); await sleep(1000);
if (arguments[0] && arguments[0].includes('--signin')) { [...document.querySelectorAll('button,a')].find((b) => b.textContent.trim() === 'Sign in')?.click(); await sleep(800); }
const toggle = [...document.querySelectorAll('*')].find((e) => e.children.length <= 1 && /Custom server URL|Server:/.test(e.textContent) && e.getBoundingClientRect().height < 40);
if (!document.querySelector('input[type=url],input[placeholder*="http"]')) { toggle.click(); await sleep(600); }
const ins = [...document.querySelectorAll('input')];
setVal(ins.find((i) => i.type === 'url' || /http|server/i.test(i.placeholder)), server);
setVal(ins.find((i) => i.type === 'email'), email);
ins.filter((i) => i.type === 'password').forEach((p) => setVal(p, password));
await sleep(300);
btn(arguments[0].includes('--signin') ? 'Sign in' : 'Create account').click();
for (let i = 0; i < 60; i++) { await sleep(1000); if (!/Create an account|Sign in to restore|Initializing app|Loading connections/.test(document.body.innerText)) break; }
return document.body.innerText.replace(/\n+/g, ' | ').slice(0, 160);
