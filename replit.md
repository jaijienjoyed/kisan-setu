# Kisan Setu

Kisan Setu helps farmers compare transparent prices, reach verified buyers, and request trusted transport for harvest lots.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kisan-setu` — deployable React + Vite frontend
- `artifacts/api-server` — Express API under `/api`
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema` — Drizzle/PostgreSQL schema
- `docs/` — GitHub handoff, API, and architecture documentation

## Architecture decisions

- Frontend requests use relative `/api` paths so Replit routing and a reverse proxy can serve the same build.
- OpenAPI is the source of truth; client hooks and Zod schemas are generated and not hand-edited.
- Marketplace demo data is stored in PostgreSQL rather than embedded in the frontend, so the prototype flows persist across reloads.
- Authentication and production transport integrations are intentionally deferred rather than represented by fake local credentials or fake provider calls.

## Product

The product includes a public landing page, marketplace browsing and filtering, listing creation, verified buyer browsing, price snapshots, dashboard summaries, listing detail views, and transport requests.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after every OpenAPI change.
- Direct frontend builds need `PORT` and `BASE_PATH`; workflows provide them automatically.
- GitHub Pages can host only the static frontend; the API and PostgreSQL need a separate host.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
