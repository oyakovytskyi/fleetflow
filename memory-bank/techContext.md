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

## Environment constraints

- Background location requires a **development build**, not Expo Go.
- Map keys / location permissions must be configured per platform.
- Local backend via `docker compose` (api + postgres + redis).

## Tooling

- ESLint + Prettier (mobile/admin)
- GitHub Actions later: lint → typecheck → test → build
- EAS: development / preview / production profiles

## Effort split (intentional)

- ~50% React Native
- ~20% Backend
- ~20% Admin
- ~10% DevOps
