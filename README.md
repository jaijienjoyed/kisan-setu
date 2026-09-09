# Kisan Setu

Kisan Setu is a farmer-to-buyer marketplace prototype for transparent prices, verified buyers, and trusted transport from the farm to the local market.

The live product experience is available in the Replit preview. This repository is also structured for a GitHub handoff: the frontend, API server, OpenAPI contract, database schema, generated client, seed data, and operating instructions are included.

## What is included

- Responsive React + Vite frontend in `artifacts/kisan-setu`
- Express API server in `artifacts/api-server`
- OpenAPI source of truth in `lib/api-spec/openapi.yaml`
- Generated React Query hooks in `lib/api-client-react`
- Generated Zod schemas in `lib/api-zod`
- PostgreSQL + Drizzle schema in `lib/db/src/schema`
- Demo data for listings, buyers, and price snapshots
- API and architecture documentation in `docs/`

## Product routes

| Route | Purpose |
| --- | --- |
| `/` | Public Kisan Setu landing page |
| `/marketplace` | Browse and filter available harvest lots |
| `/marketplace/:id` | View one lot and arrange transport |
| `/dashboard` | View marketplace totals and current price pulse |
| `/sell` | Publish a produce listing |
| `/buyers` | Browse verified buyers |
| `/transport` | Request a vehicle for a harvest lot |

## API routes

The API is served under `/api`.

- `GET /api/healthz`
- `GET /api/market/listings`
- `POST /api/market/listings`
- `GET /api/market/listings/:id`
- `PATCH /api/market/listings/:id`
- `GET /api/market/buyers`
- `GET /api/market/price-snapshot`
- `POST /api/market/transport-requests`
- `GET /api/dashboard/summary`

See [`docs/API.md`](docs/API.md) for request and response details.

## Run locally

This project uses pnpm.

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
```

In a second terminal:

```bash
pnpm --filter @workspace/kisan-setu run dev
```

Required server environment:

- `DATABASE_URL` — PostgreSQL connection string

On startup, the API creates the demo records only when the corresponding tables are empty. Remove or replace `artifacts/api-server/src/lib/seed.ts` before using this as a production data policy.

The Replit workflows provide `PORT` and `BASE_PATH` automatically. For a direct frontend build:

```bash
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/kisan-setu run build
```

## GitHub deployment options

### Recommended: GitHub repository + separate app hosting

Push this repository to GitHub, then deploy the frontend and API as services that can share environment variables:

1. Push the repository contents to GitHub.
2. Provision PostgreSQL for the API.
3. Set `DATABASE_URL` in the API host.
4. Build and serve the frontend from `artifacts/kisan-setu/dist/public`.
5. Configure the frontend host and API host to use the same `/api` origin, or add a server-side proxy for `/api`.

Replit Publish is the simplest option because it already understands the two services and the database.

### GitHub Pages

GitHub Pages can host the built static frontend, but it cannot run the Express API or PostgreSQL. If using a repository URL such as `https://<username>.github.io/<repository>/`, build with the repository path as the base:

```bash
PORT=4173 BASE_PATH=/<repository>/ pnpm --filter @workspace/kisan-setu run build
```

The API must still run on a separate backend host, and the frontend needs a proxy or configured API origin for `/api` requests.

## Regenerate API types

After changing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Do not edit generated files by hand.

## Validation

```bash
pnpm run typecheck
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/kisan-setu run build
```

## Current prototype boundaries

The current build intentionally does not include user authentication, payments, live bidding, SMS/WhatsApp notifications, real-time updates, or production transport-provider integrations. Those are the next product-layer integrations rather than part of the current prototype handoff.