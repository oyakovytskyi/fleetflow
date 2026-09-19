# Active Context

## Current focus

Sprint 1 is complete: Turborepo task graph, Expo SDK 57 app, Redux Toolkit store, TanStack Query,
axios client with SecureStore refresh, and public env config. `npm run typecheck` is green and
`expo export` bundles cleanly (1748 modules).

Next — Sprint 2: scaffold FastAPI in `apps/api` so mobile auth has a real backend to talk to.

## Recent decisions

- Workspace root = FleetFlow monorepo (folder may still be named `reactnative`).
- Monorepo tooling: **Turborepo on top of npm workspaces** (root `turbo.json`).
- `packages/config` holds `tsconfig.base.json`; every workspace extends it (mobile extends `expo/tsconfig.base` and mirrors the strict flags).
- Expo SDK 57 + Expo Router tabs (Home / Deliveries / Map / Profile).
- No hand-written Metro monorepo config — Expo SDK 52+ auto-detects workspaces.
- Template UI helpers stay in `components/` + root `constants/`; domain code in `src/`.
- Domain imports use the template's `@/` alias rooted at `apps/mobile`, so paths read `@/src/store`.
- Tokens never enter Redux — `auth` slice holds `user` + `isHydrated`; SecureStore owns the tokens.
- `apiClient` keeps a separate interceptor-free `refreshClient` and single-flights concurrent 401s.
- Query does not retry 4xx; `focusManager` is driven by `AppState` since RN has no window focus.
- Small commits: one task/feature per commit.

## Environment

- Expo Go **SDK 57** installed on the physical device → mobile app is runnable now (`npm run mobile`).
- Node v22.12.0 / npm 10.9.0. RN 0.86.2 wants Node `^22.13.0` — install warning only so far, bump Node if Metro misbehaves.

## Next steps

1. Scaffold FastAPI in `apps/api` (routes/services/repositories + `dev` script so turbo picks it up).
2. Docker Compose bring-up: api + postgres + redis.
3. JWT endpoints: register / login / refresh / me / logout.
4. Mobile auth feature: login screen, `useAuth`, session hydration on launch (`sessionRestored`).
5. Scaffold Next.js admin in `apps/admin`.
6. Add ESLint (`eslint-config-expo`) so the turbo `lint` task has a real implementation.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
- Enable Turborepo remote caching later, or stay local-only for a solo pet project?
