# TinyLink

TinyLink is a minimal URL shortener (bit.ly-style) built with Node.js, Express and Postgres.

## Features
- Create short codes (auto-generated or custom)
- Redirect with click counting and last-click timestamp
- Dashboard to create, list, delete links and view per-link stats
- Health and DB test endpoints for diagnostics

## Quick start (local)
1. Copy `.env.example` to `.env` and set `DATABASE_URL` (or export it in your shell).

2. Install dependencies and run the app:

```powershell
npm install
#$env:DATABASE_URL='postgres://user:pass@host:5432/tinylink'
$env:DATABASE_URL='postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require&channel_binding=require'
npm start
```

Open http://localhost:3000/ in your browser to access the dashboard.

## Database
- A migration SQL is included at `migrations/create_links.sql`.

Run it manually (optional):

```powershell
psql $env:DATABASE_URL -f migrations/create_links.sql
```

The application will also attempt to create the `links` table automatically on startup if it does not exist.

## API Endpoints
- `GET /healthz` — returns `{ ok: true, version: "1.x" }`
- `GET /test-db` — runs `SELECT NOW()` to verify DB connectivity
- `POST /api/links` — Create a link
	- Body: `{ "url": "https://example.com", "code": "abc123" }` (code optional)
	- Responses: `201` created, `400` bad input, `409` conflict when code exists
- `GET /api/links` — List links
- `GET /api/links/:code` — Get single link stats (404 if not found)
- `DELETE /api/links/:code` — Delete a link (404 if not found)
- `GET /:code` — Public redirect (302) — increments `clicks` and updates `last_clicked`

## Postman
- A Postman collection is included at `postman_collection.json`. Import it and set the `baseUrl` variable (default `http://localhost:3000`).

## UI
- The dashboard is implemented using Tailwind (CDN) and available at `/` with a stats page at `/stats.html`.

## Deployment
- Ensure `DATABASE_URL` is set in the host environment. For NeonDB, SSL is enabled in the pool config.

## Acceptance checklist
- `GET /healthz` returns 200
- Creating links works (`POST /api/links`)
- Duplicate code returns 409
- Redirect issues 302 and increments clicks
- Deleting a link causes redirect to return 404
- Dashboard can create/list/delete and shows stats page

## Next steps (optional)
- Add server-side search or paging for large datasets
- Add automated tests (Jest + Supertest)
- Add CI (GitHub Actions) to run tests / lint on push
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
