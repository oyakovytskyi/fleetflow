# Tech Context

## Stack

### Mobile (`apps/mobile`)

- React Native, Expo, TypeScript, Expo Router
- Redux Toolkit, TanStack Query, Axios
- expo-location, expo-task-manager, expo-secure-store, expo-network
- AsyncStorage (offline queue), react-native-maps
- expo-notifications (v2), EAS Build profiles

### Admin (`apps/admin`)

- Next.js, TypeScript, TanStack Query, Redux Toolkit (light), Tailwind
- WebSocket client for live map

### API (`apps/api`)

- Python, FastAPI, SQLAlchemy, Pydantic, JWT
- PostgreSQL, Redis, Docker
- pytest

### Shared

- `packages/shared-types` — TypeScript types mirrored for Python schemas where needed
- `packages/config` — `tsconfig.base.json` strict preset for all TS workspaces

## Environment constraints

- Background location requires a **development build**, not Expo Go.
- Expo Go **SDK 57** is installed on the test device; foreground work can be verified there today.
- Node v22.12.0 / npm 10.9.0 locally; RN 0.86.2 declares Node `^22.13.0` — bump Node if Metro acts up.
- Map keys / location permissions must be configured per platform.
- Local backend via `docker compose` (api + postgres + redis).

## Tooling

- **Turborepo** (`turbo@^2.11`) over npm workspaces — root `turbo.json` task graph.
- Root commands: `npm run mobile`, `npm run admin`, `npm run api`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run test`.
- Turbo requires the root `packageManager` field; keep it matching the installed npm.
- Local turbo cache in `.turbo/` (gitignored); remote caching not enabled.
- ESLint + Prettier (mobile/admin)
- GitHub Actions later: `turbo run lint typecheck test build`
- EAS: development / preview / production profiles

## Effort split (intentional)

- ~50% React Native
- ~20% Backend
- ~20% Admin
- ~10% DevOps
