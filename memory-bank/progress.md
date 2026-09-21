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
- [x] FastAPI scaffold (`routes → services → repositories → models`)
- [x] Docker Compose: api + postgres + redis (healthchecks, reload mount)
- [x] JWT auth: register / login / refresh / me / logout (camelCase wire format)
- [x] Refresh rotation + replay family revoke verified via smoke script
- [x] Shared-types auth DTOs (`AuthResponseDto`, `LoginRequestDto`, …)
- [x] Mobile auth UI: login/register, session hydration, auth-gated routing
- [x] Profile screen shows user + sign out
- [x] Delivery model + endpoints (create/list/get/claim/start/complete/cancel/assign)
- [x] Mobile deliveries list + detail with claim/start/complete actions
- [x] Sprint 4 maps: Leaflet/OSM WebView (free tiles), markers, polyline, picker
- [x] Deliveries UI slice (`selectedDeliveryId`) + View on map from detail
- [x] Theme tokens for readable light/dark UI
- [x] Foreground GPS watch + `POST /tracking/location` + Redis hot key
- [x] Auto-start tracking on delivery start / resume when IN_PROGRESS

## In progress

- [ ] Device smoke test for tracking + OSM map
- [ ] Push feature branches when SSH/auth available
- [ ] Sprint 6: WebSocket admin live map
- [ ] Scaffold Next.js admin
- [ ] ESLint config so the turbo `lint` task does real work

## Remaining (high level)

### MVP v1

- [x] Auth API (JWT + refresh rotation)
- [x] Auth mobile UI (SecureStore/AsyncStorage + refresh interceptor)
- [x] Deliveries API + mobile list/detail
- [x] Map (driver/pickup/destination + polyline via Leaflet/OSM)
- [x] Foreground GPS → POST /tracking/location (Redis; WS fan-out next)
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

- `apps/admin` is still a placeholder package (echo `dev` script), not a real Next.js app.
- Mobile runs in Expo Go SDK 57; background GPS still blocked until an EAS development build.
- Node v22.12.0 is below RN 0.86.2's declared minimum (`^22.13.0`) — install-time warning.
- API schema via `create_all` on boot — migrate to Alembic before anything resembling production.
- Physical phone cannot reach `localhost:8000`; set `EXPO_PUBLIC_API_URL` to the machine's LAN IP.
