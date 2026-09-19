# Active Context

## Current focus

Sprint 1. Expo SDK 57 scaffold + Turborepo task graph are in place and `npm run typecheck` is green.
Next — Redux Toolkit + TanStack Query providers on mobile, then API/admin scaffolds.

## Recent decisions

- Workspace root = FleetFlow monorepo (folder may still be named `reactnative`).
- Monorepo tooling: **Turborepo on top of npm workspaces** (root `turbo.json`).
- `packages/config` holds `tsconfig.base.json`; every workspace extends it (mobile extends `expo/tsconfig.base` and mirrors the strict flags).
- Expo SDK 57 + Expo Router tabs (Home / Deliveries / Map / Profile).
- No hand-written Metro monorepo config — Expo SDK 52+ auto-detects workspaces.
- Template UI helpers stay in `components/` + root `constants/`; domain code in `src/`.
- Small commits: one task/feature per commit.

## Environment

- Expo Go **SDK 57** installed on the physical device → mobile app is runnable now (`npm run mobile`).
- Node v22.12.0 / npm 10.9.0. RN 0.86.2 wants Node `^22.13.0` — install warning only so far, bump Node if Metro misbehaves.

## Next steps

1. Wire Redux Toolkit store + TanStack Query provider in `app/_layout.tsx`.
2. Env config (`app.config.ts` + `EXPO_PUBLIC_API_URL`) and `src/constants` intervals/storage keys.
3. Scaffold FastAPI in `apps/api` (add `dev` script so turbo picks it up).
4. Scaffold Next.js admin in `apps/admin`.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
- Enable Turborepo remote caching later, or stay local-only for a solo pet project?
