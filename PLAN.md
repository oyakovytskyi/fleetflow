# FleetFlow — Implementation Plan

## Goal

Ship a credible pet-project fleet tracker that demonstrates Expo RN maps/GPS, JWT, WebSockets, and an admin live map — MVP first, then background/offline.

## Architecture snapshot

```
React Native (Expo) ──REST/WS──▶ FastAPI ──▶ PostgreSQL
                                   │
                                   └── Redis (last location + trail + pub/sub)
                                          │
Next.js Admin ◀──────────WS───────────────┘
```

Maps: Leaflet + OSM tiles; mobile routing via public OSRM.

## Status (2026-09-22)

**Sprint 9 admin depth on `feat/sprint-9-admin-depth`.**  
MVP demo path proven with `npm run demo:drive` (marker + trail over WS).

| Sprint | Focus | Status |
| --- | --- | --- |
| 0–3 | Bootstrap → deliveries | Done |
| 4 | Maps (Leaflet/OSM) | Done |
| 5 | Foreground GPS tracking | Done |
| 6 | WebSocket + admin live map + OSRM | Done |
| 7 | Offline location queue | Done |
| 8 | Background GPS + EAS scaffold | Done (EAS build manual) |
| 9 | Admin depth + demo drive | **In progress** |
| 10 | Production polish | Later |

## Definition of done (MVP)

Driver can log in, start a delivery, share GPS; admin sees the marker move over WebSocket without refresh.

**Satisfied** via phone *or* `npm run demo:drive` with admin `/live` open.

## Sprint 8 — Background GPS (v2)

1. [x] TaskManager + `startLocationUpdatesAsync`
2. [x] Permissions UX (background vs Expo Go messaging)
3. [x] EAS scaffold (`eas.json`, bundle ids, background location plugins)
4. [ ] Run `eas build --profile development` on a device (manual)
5. [x] Commit + push `feat/sprint-8-background`

## Sprint 9 — Admin depth (v2) ← current

1. [x] Deliveries page + create / assign / cancel
2. [x] Driver list endpoint + live trail polyline
3. [x] Assign delivery (existing race-safe API)
4. [x] `demo:drive` GPS simulator for portfolio demos
5. [ ] Commit + push `feat/sprint-9-admin-depth`

## Sprint 10 — Production polish (v3)

1. [ ] Error/empty/loading states
2. [ ] Performance pass (lists + map)
3. [ ] Unit/integration tests
4. [ ] CI + ESLint + README polish

## Local / remote

- Local path: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Current branch: `feat/sprint-9-admin-depth`
