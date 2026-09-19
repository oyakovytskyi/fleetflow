# Active Context

## Current focus

Sprint 2 API core is up: FastAPI + Postgres + Redis via Docker Compose, JWT auth endpoints
verified end-to-end (register/login/refresh/me/logout). Stack is running on `:8000`.

Next — mobile auth feature (login/register screens + session hydration against this API).

## Recent decisions

- Workspace root = FleetFlow monorepo (folder may still be named `reactnative`).
- Monorepo tooling: **Turborepo on top of npm workspaces** (root `turbo.json`).
- API runs in Docker only for now (no local Python install required).
- Wire format is **camelCase** (Pydantic `alias_generator=to_camel`) to match `@fleetflow/shared-types`.
- Refresh tokens are stored by `jti` and rotated on every refresh; replay revokes the whole family.
- Schema via `create_all` on boot for MVP — Alembic later.
- Tokens never enter Redux — `auth` slice holds `user` + `isHydrated`; SecureStore owns the tokens.
- Small commits: one task/feature per commit.

## Environment

- Expo Go **SDK 57** on device; API at `http://localhost:8000` (use LAN IP in mobile `.env` for a physical phone).
- Docker Desktop required for `npm run api` / `docker compose up`.
- Node v22.12.0 / npm 10.9.0.

## Next steps

1. Mobile auth feature: login/register UI, `useAuth`, hydrate via `/auth/me` on launch.
2. Delivery model + CRUD/status endpoints.
3. Scaffold Next.js admin in `apps/admin`.
4. Add ESLint (`eslint-config-expo`) so the turbo `lint` task does real work.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
- Enable Turborepo remote caching later, or stay local-only for a solo pet project?
