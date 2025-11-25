# TinyLink

TinyLink is a minimal URL shortener (bit.ly-style) built with Node.js, Express and Postgres.

## Features
- Create short codes (auto-generated or custom)
- Redirect with click counting
- Simple dashboard to create/list/delete links and view stats
- Health check endpoint

## Environment
Create a `.env` file (or set env vars) — see `.env.example`.

Required:
- `DATABASE_URL` — Postgres connection string (e.g. `postgres://user:pass@host:5432/db`)

Optional:
- `BASE_URL` — base URL for frontend link generation
- `PORT` — server port (default 3000)

## Database
A migration SQL is included at `migrations/create_links.sql`.
You can run it manually:

```powershell
psql $env:DATABASE_URL -f migrations/create_links.sql
```

The app will also attempt to create the table automatically on startup if it does not exist.

## Run locally
1. Install dependencies

```powershell
npm install
```

2. Start with `DATABASE_URL` set:

```powershell
$env:DATABASE_URL='postgres://user:pass@host:5432/tinylink'; npm start
```

Open http://localhost:3000/ to use the dashboard.

## API Endpoints (summary)
- `GET /healthz` — { ok: true, version: "1.x" }
- `POST /api/links` — Create link. Body: `{ url: string, code?: string }`
- `GET /api/links` — List links
- `GET /api/links/:code` — Get single link stats
- `DELETE /api/links/:code` — Delete link
- `GET /:code` — Public redirect (302)

## Deployment
Works on typical Node + Postgres hosts (Render, Railway, Heroku, etc.). Ensure `DATABASE_URL` is set in the deployment environment.

## Notes & Next Steps
- Consider adding automated tests (Jest + Supertest).
- Consider adding migrations tooling (e.g. `node-pg-migrate` or `knex` migrations) for production.
- Add a short demo video explaining the app and endpoints if required by evaluator.
