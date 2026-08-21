# Active Context

## Current focus

Sprint 1: Expo mobile scaffold done. Next — Redux Toolkit + TanStack Query, then API/admin scaffolds.

## Recent decisions

- Workspace root = FleetFlow monorepo (folder may still be named `reactnative`).
- Monorepo tooling: **npm workspaces**.
- Expo SDK 57 + Expo Router tabs (Home / Deliveries / Map / Profile).
- Template UI helpers stay in `components/` + root `constants/`; domain code in `src/`.
- Small commits: one task/feature per commit.

## Next steps

1. Commit: npm workspaces (if not yet).
2. Commit: Expo mobile scaffold.
3. Wire Redux Toolkit + TanStack Query on mobile.
4. Scaffold FastAPI in `apps/api`.
5. Scaffold Next.js admin in `apps/admin`.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
