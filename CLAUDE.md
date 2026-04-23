@AGENTS.md

## Layout

```
web/
├── landing/   # voltius.app — Next.js marketing site
└── portal/    # app.voltius.app — Next.js web auth portal
```

Each is an independent Next.js app with its own `package.json` and `pnpm-lock.yaml`.
No workspace — install and deploy each separately.
