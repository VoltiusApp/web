@AGENTS.md

## Layout

```
web/
├── landing/   # voltius.app — Next.js marketing site
├── portal/    # app.voltius.app — Next.js web auth portal
└── promo/     # Remotion promo videos (README/landing demo, trailer) — see promo/README.md
```

`landing/` and `portal/` are independent Next.js apps with their own `package.json` and `pnpm-lock.yaml`; `promo/` uses npm and is not deployed.
No workspace — install and deploy each separately.
