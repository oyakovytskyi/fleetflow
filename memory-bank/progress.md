# Progress

## Done

- [x] Capture project idea from `task.txt`
- [x] Architecture decision log in memory bank
- [x] Cursor rules for monorepo / mobile / API
- [x] Folder skeleton: apps, packages, hooks, types, constants
- [x] `PLAN.md` sprint backlog
- [x] Git init commit
- [x] npm workspaces root (`@fleetflow/*`)
- [x] Expo app scaffold in `apps/mobile` (Expo Router tabs: Home/Deliveries/Map/Profile)
- [x] Turborepo task graph (`build`/`typecheck`/`lint`/`test`/`dev`/`start`) + root scripts
- [x] Shared `@fleetflow/config` tsconfig preset consumed by `shared-types`
- [x] `npm run typecheck` green across workspaces
- [x] Redux Toolkit store: `auth` / `tracking` / `network` slices + typed hooks
- [x] TanStack Query client (no 4xx retries, `AppState` focus manager)
- [x] Axios client: bearer injection, single-flight refresh, one retry per 401
- [x] SecureStore token storage + public env config (`EXPO_PUBLIC_API_URL`)
- [x] Providers wired in `app/_layout.tsx`; Home screen shows live store state
- [x] Metro bundle smoke test via `expo export` (1748 modules, no resolution errors)

## In progress

- [ ] Sprint 2: FastAPI scaffold + docker compose + JWT endpoints
- [ ] Mobile auth feature (login screen + session hydration)
- [ ] ESLint config so the turbo `lint` task does real work

## Remaining (high level)

### MVP v1

- [ ] Auth (JWT + SecureStore + refresh interceptor)
- [ ] Deliveries API + mobile list/detail
- [ ] Map (driver/pickup/destination + polyline)
- [ ] Foreground GPS → POST/WS location
- [ ] Admin live map

### v2

- [ ] Background location + TaskManager
- [ ] Offline location queue + sync
- [ ] Redis pub/sub hardening
- [ ] Route/trip history
- [ ] Push notifications

### v3

- [ ] Performance (memo, FlatList, normalized state)
- [ ] Tests (Jest + pytest)
- [ ] Docker + CI + EAS + README polish

## Known issues

- `apps/api` and `apps/admin` are placeholder packages (echo `dev` scripts), not real apps.
- Mobile runs in Expo Go SDK 57; background GPS still blocked until an EAS development build.
- Node v22.12.0 is below RN 0.86.2's declared minimum (`^22.13.0`) — install-time warning.
