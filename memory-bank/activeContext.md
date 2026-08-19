# Active Context

## Current focus

Project bootstrap: memory bank, Cursor rules, monorepo folder skeleton, architecture decisions. **No app runtime yet** (Expo/Next/FastAPI apps not generated).

## Recent decisions

- Workspace root = FleetFlow monorepo (folder may still be named `reactnative`).
- MVP-first: foreground GPS + WS before background/offline.
- Feature-based mobile `src/` with dedicated `hooks/`, `types/`, `constants/`.
- Redux Toolkit for client session/tracking; TanStack Query for server lists.

## Next steps

1. Initialize git (if not already) and root README.
2. Scaffold Expo app in `apps/mobile` with Expo Router + TS.
3. Scaffold FastAPI in `apps/api` with auth + deliveries stubs.
4. Scaffold Next.js admin in `apps/admin`.
5. Add `packages/shared-types` DeliveryStatus / WS event types.
6. Implement Sprint 1–3 from `PLAN.md`.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
- Prefer npm workspaces / pnpm for monorepo tooling?
