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

## In progress

- [ ] Sprint 1 remaining: Redux Toolkit + TanStack Query
- [ ] Scaffold FastAPI + Next.js admin

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

- Apps are scaffold placeholders only; cannot run yet.
- Background GPS blocked until EAS development build.
