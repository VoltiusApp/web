const LABELS = new Set(['MobaXterm', 'Termius', 'ZOC Terminal', 'PuTTY', 'SecureCRT']);
const named = (el) => { const t = el.textContent.trim(); return LABELS.has(t) || LABELS.has(t.replace(/^From /, '')); };
const sweep = () => document.querySelectorAll('button, [role=menuitem], [role=option], li').forEach((el) => {
  if (!named(el)) return;
  el.querySelectorAll('svg.iconify--custom, svg.iconify--simple-icons, img').forEach((i) => { i.style.display = 'none'; });
});
window.__promoNoLogo?.disconnect();
window.__promoNoLogo = new MutationObserver(sweep);
window.__promoNoLogo.observe(document.body, { childList: true, subtree: true });
sweep();
return 'no competitor logos';
