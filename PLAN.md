# FleetFlow — Implementation Plan

## Goal

Ship a credible pet-project fleet tracker that demonstrates Expo RN maps/GPS, JWT, WebSockets, and an admin live map — MVP first, then background/offline.

## Architecture snapshot

```
React Native (Expo) ──REST/WS──▶ FastAPI ──▶ PostgreSQL
                                   │
                                   └── Redis (last location + pub/sub)
                                          │
Next.js Admin ◀──────────WS───────────────┘
```

## Phase 0 — Bootstrap (current)

- [x] Memory bank + Cursor rules
- [x] Folder skeleton + shared-types stubs
- [x] Git init
- [x] Root tooling (Turborepo + npm workspaces, shared tsconfig preset)
- [ ] Real Expo / Next / FastAPI app generation (Expo + FastAPI done; Next pending)

## Sprint 1 — Foundation (mobile + monorepo)

1. [x] Create Expo app in `apps/mobile` (TS, Expo Router)
2. [x] Turborepo task graph + green `npm run typecheck`
3. [x] Wire `src/` feature layout, Redux Toolkit, TanStack Query
4. [x] Constants + env config (`EXPO_PUBLIC_API_URL`); theme tokens still template defaults
5. [x] Shared-types package consumed by mobile (`src/types` re-exports DTOs)

## Sprint 2 — Backend core

1. [x] FastAPI project skeleton (routes/services/repositories)
2. [x] Docker Compose: api + postgres + redis
3. [x] User model + roles (`DRIVER` | `ADMIN`)
4. [x] JWT: register/login/refresh/me/logout

## Sprint 3 — Deliveries + mobile auth UI

1. Delivery model + CRUD/status endpoints
2. [x] Mobile login/register + SecureStore + Axios refresh
3. Deliveries list + detail screens

## Sprint 4 — Maps

1. react-native-maps setup
2. Current location, driver/pickup/destination markers
3. Polyline + camera helpers

## Sprint 5 — Foreground tracking

1. Location service (`watchPositionAsync`)
2. `POST /tracking/location`
3. Tracking Redux slice + start/stop on delivery

## Sprint 6 — Realtime + admin MVP

1. WebSocket backend + `driver.location.updated`
2. Mobile WS client + reconnect backoff
3. Admin login + live map markers
4. Basic dashboard counts

## Sprint 7 — Offline (v2)

1. Network detection
2. Location queue in AsyncStorage
3. Flush on reconnect

## Sprint 8 — Background GPS (v2)

1. TaskManager + `startLocationUpdatesAsync`
2. Permissions UX
3. EAS development build

## Sprint 9 — Admin depth (v2)

1. Drivers / deliveries pages
2. Driver detail + trip polyline history
3. Assign delivery with race-safe backend

## Sprint 10 — Production polish (v3)

1. Error/empty/loading states
2. Performance pass (lists + map)
3. Unit/integration tests
4. CI + EAS profiles + README

## Effort bias

| Area | Share |
| --- | --- |
| Mobile | ~50% |
| API | ~20% |
| Admin | ~20% |
| DevOps | ~10% |

## Definition of done (MVP)

Driver can log in, start a delivery, share GPS; admin sees the marker move over WebSocket without refresh.
