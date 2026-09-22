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
- [x] JWT auth: register/login/refresh/me/logout (camelCase wire format)
- [x] Refresh rotation + replay family revoke verified via smoke script
- [x] Shared-types auth DTOs (`AuthResponseDto`, `LoginRequestDto`, …)
- [x] Mobile auth UI: login/register, session hydration, auth-gated routing
- [x] Profile screen shows user + sign out
- [x] Delivery model + endpoints (create/list/get/claim/start/complete/cancel/assign)
- [x] Mobile deliveries list + detail with claim/start/complete actions
- [x] Sprint 4 maps: Leaflet/OSM WebView (free tiles), markers, picker
- [x] Deliveries UI slice (`selectedDeliveryId`) + View on map from detail
- [x] Theme tokens for readable light/dark UI
- [x] Foreground GPS watch + `POST /tracking/location` + Redis hot key + pub/sub publish
- [x] Auto-start tracking on delivery start / resume when IN_PROGRESS
- [x] WebSocket `/ws/live` + LiveHub Redis fan-out + `GET /tracking/locations`
- [x] Mobile `WebSocketManager` reconnect (ADMIN sessions)
- [x] Next.js admin: login, live Leaflet map, counts, seed demo delivery
- [x] Mobile OSRM road routing (distance/ETA; driver→dest when tracking)
- [x] Admin polish: freshness, responsive layout, recenter
- [x] Root README runbook updated for full stack demo
- [x] Delivery lifecycle WS events + role-filtered fan-out
- [x] Local notifications (mobile) + browser notifications + admin activity feed
- [x] Sprint 6 committed on `feat/sprint-6-realtime`
- [x] NetInfo → Redux online/offline
- [x] AsyncStorage GPS queue + flush on reconnect
- [x] Pushed `feat/sprint-4-maps` … `feat/sprint-7-offline` to GitHub
- [x] Background location TaskManager + EAS scaffold (`eas.json`)
- [x] Admin deliveries page (create / assign / cancel) + driver list API
- [x] Redis location trails + admin map polylines
- [x] `npm run demo:drive` GPS simulator (MVP DoD proof without phone)
- [x] Shared ESLint flat config + `npm run lint`
- [x] GitHub Actions CI (typecheck + lint + API pytest)
- [x] API pytest smoke (domain errors + enums)
- [x] Admin deliveries loading / error / empty polish

## In progress / blocked on human

- [ ] Optional phone E2E smoke
- [ ] `eas build --profile development` for real background GPS
- [x] Commit + push Sprint 10 (`feat/sprint-10-polish`)

## Remaining (high level)

### MVP v1

- [x] Auth API (JWT + refresh rotation)
- [x] Auth mobile UI (SecureStore/AsyncStorage + refresh interceptor)
- [x] Deliveries API + mobile list/detail
- [x] Map (OSM/Leaflet + OSRM road route)
- [x] Foreground GPS → POST /tracking/location (Redis)
- [x] Admin live map (WS + Next.js)
- [ ] Confirmed phone ↔ admin live marker demo

### v2

- [x] Background location + TaskManager (EAS build still manual)
- [x] Offline location queue + sync
- [x] Redis pub/sub hardening
- [ ] Route/trip history (partial via Redis trail)
- [ ] Push notifications (local/browser only today)

### v3

- [ ] Performance (memo, FlatList, normalized state)
- [x] Tests (API pytest smoke; Jest later)
- [x] Docker + CI + ESLint polish

## Known issues

- Mobile runs in Expo Go SDK 57; background GPS blocked until an EAS development build.
- Node may warn below RN’s declared minimum — install-time only.
- API schema via `create_all` on boot — migrate to Alembic before production-like deploys.
- Physical phone cannot reach `localhost:8000`; set `EXPO_PUBLIC_API_URL` to the machine LAN IP.
- Admin defaults to `NEXT_PUBLIC_API_URL=http://localhost:8000`.
- Public OSRM demo can rate-limit; dashed straight-line fallback then applies.
- Host Windows may lack a system Python; API tests run in CI / Docker.
