This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Dashboard

The admin dashboard lives at `/admin`. It requires three environment variables.

### Local development (`web/.env.local`)

```env
ADMIN_EMAILS=you@example.com
ADMIN_PASSWORD=your-admin-password
ADMIN_SECRET=a-long-random-shared-secret
ADMIN_API_URL=http://localhost:8080
```

- `ADMIN_EMAILS` — comma-separated list of emails allowed to log in to the dashboard
- `ADMIN_PASSWORD` — single shared password for all admin emails
- `ADMIN_SECRET` — shared secret sent as `X-Admin-Key` to the Axum server; must match `ADMIN_SECRET` in the server's `.env`
- `ADMIN_API_URL` — base URL of the Axum API (no trailing slash)

### Vercel deployment

In the Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `ADMIN_EMAILS` | `you@example.com` |
| `ADMIN_PASSWORD` | your admin password |
| `ADMIN_SECRET` | must match the value set on the server |
| `ADMIN_API_URL` | `https://your-server-domain.com` |

Or via CLI:

```bash
vercel env add ADMIN_EMAILS
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_SECRET
vercel env add ADMIN_API_URL
```

Then redeploy. The dashboard is accessible at `https://your-vercel-domain.com/admin/login`.

> The Vercel deployment must be able to reach `ADMIN_API_URL` over the internet. `localhost` will not work in production.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
