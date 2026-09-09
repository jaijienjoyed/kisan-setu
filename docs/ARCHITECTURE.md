# Architecture

## Frontend

`artifacts/kisan-setu` is a React + Vite app using:

- Wouter for route handling
- TanStack React Query for server state
- generated API hooks from `@workspace/api-client-react`
- Tailwind CSS and the local UI primitives
- a warm Kisan Setu visual language: editorial serif headings, data-focused mono labels, cream canvas, navy text, coral actions, and field green trust accents

The frontend uses relative `/api` requests so it can run behind the Replit path proxy or behind a reverse proxy in another host.

## Backend

`artifacts/api-server` is an Express 5 service. It exposes `/api` and uses:

- Pino request logging
- OpenAPI-generated Zod validation
- Drizzle ORM through `@workspace/db`
- PostgreSQL

The API is intentionally thin: routes validate inputs, query or mutate the database, and validate the response shape before returning it.

## Data model

- `listings` — farmer harvest lots and transparent pricing
- `buyers` — verified buyer profiles and crop interests
- `price_snapshots` — local mandi, fair, and best-buyer comparisons
- `transport_requests` — vehicle requests connected to listings

## Contract flow

1. Change `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen`.
3. Update the server routes using the generated Zod schemas.
4. Update the frontend using the generated React Query hooks.
5. Run the typecheck and frontend build.

The generated files are not source-of-truth files and should not be edited manually.

## Production hardening still needed

Before a public launch, add an authentication provider, ownership checks on listing mutations, rate limiting, audit logging, real transport-provider connectivity, and a production seed/migration policy. These are intentionally not fabricated in the prototype.