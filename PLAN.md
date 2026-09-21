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

Maps: Leaflet + Carto/OSM tiles; pickup/driver→destination geometry via public OSRM (OSM roads).

## Status (2026-09-21)

**Sprint 7 offline queue on `feat/sprint-7-offline`.**  
Sprint 6 is committed on `feat/sprint-6-realtime`.

| Sprint | Focus | Status |
| --- | --- | --- |
| 0–3 | Bootstrap → deliveries | Done |
| 4 | Maps (Leaflet/OSM) | Done (`feat/sprint-4-maps`) |
| 5 | Foreground GPS tracking | Done (`feat/sprint-5-tracking`) |
| 6 | WebSocket + admin live map + OSRM routes | Done (`feat/sprint-6-realtime`) |
| 7 | Offline location queue | **In progress** |
| 8–10 | Background / admin depth / polish | Later |

## Phase 0 — Bootstrap

- [x] Memory bank + Cursor rules
- [x] Folder skeleton + shared-types stubs
- [x] Git init
- [x] Root tooling (Turborepo + npm workspaces, shared tsconfig preset)
- [x] Expo + FastAPI generated; Next.js admin scaffolded (Sprint 6)

## Sprint 1 — Foundation (mobile + monorepo)

1. [x] Create Expo app in `apps/mobile` (TS, Expo Router, SDK 57)
2. [x] Turborepo task graph + green `npm run typecheck`
3. [x] Wire `src/` feature layout, Redux Toolkit, TanStack Query
4. [x] Constants + env config (`EXPO_PUBLIC_API_URL`); theme tokens still template defaults
5. [x] Shared-types package consumed by mobile

## Sprint 2 — Backend core

1. [x] FastAPI project skeleton (routes/services/repositories)
2. [x] Docker Compose: api + postgres + redis
3. [x] User model + roles (`DRIVER` | `ADMIN`)
4. [x] JWT: register/login/refresh/me/logout (camelCase wire format, refresh rotation)

## Sprint 3 — Deliveries + mobile auth UI

1. [x] Delivery model + CRUD/status endpoints (claim/start/complete/cancel/assign)
2. [x] Mobile login/register + SecureStore/AsyncStorage fallback + Axios refresh
3. [x] Deliveries list + detail screens

## Sprint 4 — Maps

1. [x] Free OSM map via Leaflet WebView (no Google/Mapbox API key)
2. [x] Current location, driver/pickup/destination markers
3. [x] Polyline + camera helpers (fit bounds) — later upgraded to OSRM road geometry
4. [x] Wire map tab to active / selected delivery

## Sprint 5 — Foreground tracking

1. [x] Location service (`watchPositionAsync`)
2. [x] `POST /tracking/location` (Redis last-known + pub/sub publish)
3. [x] Tracking Redux slice + start/stop on delivery start/complete
4. [ ] Device smoke test (start delivery → GPS sharing on → map updates)

## Sprint 6 — Realtime + admin MVP

1. [x] WebSocket backend + Redis fan-out (`/ws/live`, `driver.location.updated`)
2. [x] Mobile WS client + reconnect backoff (DRIVER + ADMIN)
3. [x] Scaffold Next.js admin + login + live OSM map markers
4. [x] Basic dashboard counts + seed demo delivery
5. [x] Mobile OSRM road routing (distance / ETA; driver→dest when tracking)
6. [x] Admin polish (freshness, responsive layout, recenter, README runbook)
7. [x] Delivery lifecycle WS events (`created` / `assigned` / `started` / `completed` / `cancelled`)
8. [x] Local notifications (mobile) + browser notifications + admin activity feed
9. [ ] End-to-end: phone GPS → admin marker moves
10. [x] Commit `feat/sprint-6-realtime`
11. [ ] Push feature branches when GitHub auth works

## Sprint 7 — Offline (v2) ← current

1. [x] Network detection (NetInfo → Redux)
2. [x] Location queue in AsyncStorage (cap 200)
3. [x] Flush on reconnect (FIFO)
4. [ ] Commit `feat/sprint-7-offline`

## Sprint 8 — Background GPS (v2)

1. [ ] TaskManager + `startLocationUpdatesAsync`
2. [ ] Permissions UX
3. [ ] EAS development build (required — not Expo Go)

## Sprint 9 — Admin depth (v2)

1. [ ] Drivers / deliveries pages
2. [ ] Driver detail + trip polyline history
3. [ ] Assign delivery with race-safe backend

## Sprint 10 — Production polish (v3)

1. [ ] Error/empty/loading states
2. [ ] Performance pass (lists + map)
3. [ ] Unit/integration tests
4. [ ] CI + EAS profiles + README

## Effort bias

| Area | Share |
| --- | --- |
| Mobile | ~50% |
| API | ~20% |
| Admin | ~20% |
| DevOps | ~10% |

## Definition of done (MVP)

Driver can log in, start a delivery, share GPS; admin sees the marker move over WebSocket without refresh.

## Local / remote

- Local path: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Current branch: `feat/sprint-6-realtime` (Sprint 6 + polish; largely uncommitted)
