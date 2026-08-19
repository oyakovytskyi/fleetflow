# System Patterns & Architecture Decisions

## Monorepo layout

```
fleetflow/   (this workspace root)
├── apps/mobile     # Expo + Expo Router + TypeScript
├── apps/admin      # Next.js + TypeScript
├── apps/api        # FastAPI + SQLAlchemy
├── packages/shared-types
├── memory-bank/
├── .cursor/rules/
├── docker-compose.yml
└── PLAN.md
```

## Decision log

| Decision | Choice | Why |
| --- | --- | --- |
| Mobile framework | Expo (dev client for background GPS) | Vacancy alignment; managed workflow + EAS |
| Navigation | Expo Router (file-based) | Standard Expo pattern; auth/tabs groups |
| Client state | Redux Toolkit | Interview alignment (Redux/Zustand); predictable slices |
| Server state | TanStack Query | Cache/list/detail for REST; Redux stays UI/session/tracking |
| HTTP | Axios + interceptors | Token refresh / retry on 401 |
| Maps | `react-native-maps` | Markers, polylines, camera — vacancy checklist |
| Secure tokens | `expo-secure-store` | Access + refresh tokens only |
| Realtime | FastAPI WebSocket + Redis Pub/Sub | Scale admin fan-out; interview-ready |
| Persistence | PostgreSQL | Deliveries, users, location history |
| Hot location | Redis keys `driver:{id}:location` | Fast last-known position |
| API shape | Feature modules + services + repositories | Testable domain boundaries |
| Shared contracts | `packages/shared-types` | One source for enums/WS payloads |
| Offline | Dedicated location queue module | Clear sync/retry story |
| Concurrency | DB constraints + transactions | Prevent double-assign / double start |
| Admin effort | Thin Next.js dashboard | Maximize RN learning time (~50% mobile) |
| Firebase | Optional analytics/crash only | Not core backend |

## Mobile feature architecture

Prefer **feature folders** over flat `screens/`:

```
apps/mobile/src/
├── features/
│   ├── auth/
│   ├── deliveries/
│   ├── tracking/
│   ├── map/
│   └── profile/
├── components/     # shared UI only
├── hooks/          # shared hooks (feature hooks live in features/*)
├── services/       # api, websocket, location, storage
├── store/          # RTK slices
├── types/          # mobile-only types (prefer shared-types)
├── constants/
└── utils/
```

Rules:

- Screens in `app/` are thin: compose hooks + feature UI.
- Feature logic lives in `features/<name>/` (hooks, components, api, types).
- Shared cross-feature hooks only in `src/hooks/`.
- Never put secrets or API base URLs hardcoded — use `constants` + env.

## Redux slices (mobile)

- `auth` — user, tokens hydrated flag
- `deliveries` — UI selection / optimistic local flags (lists from Query)
- `tracking` — `currentLocation`, `isTracking`, `activeDeliveryId`, `connectionStatus`, `pendingLocations`
- `network` — online/offline

## WebSocket contract

Event: `driver.location.updated`

```json
{ "driverId": "123", "lat": 50.087, "lng": 14.421, "timestamp": 1720000000 }
```

Client `WebSocketManager`: `connect`, `disconnect`, `subscribe`, `send`, exponential backoff (1s→16s cap).

## Backend layering

```
api/routes → services → repositories → models
websocket/ → redis pubsub → fan-out to admin clients
```

## Delivery status machine

`PENDING → ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`

Illegal transitions rejected server-side (e.g. `IN_PROGRESS → IN_PROGRESS`).
