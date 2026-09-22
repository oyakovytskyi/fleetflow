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

**Sprint 10 polish on `feat/sprint-10-polish`.**  
Sprints 0–9 complete; MVP DoD proven with `npm run demo:drive`.

| Sprint | Focus | Status |
| --- | --- | --- |
| 0–3 | Bootstrap → deliveries | Done |
| 4 | Maps (Leaflet/OSM) | Done |
| 5 | Foreground GPS tracking | Done |
| 6 | WebSocket + admin live map + OSRM | Done |
| 7 | Offline location queue | Done |
| 8 | Background GPS + EAS scaffold | Done (EAS build manual) |
| 9 | Admin depth + demo drive | Done |
| 10 | Production polish | **In progress** |

## Definition of done (MVP)

Driver can log in, start a delivery, share GPS; admin sees the marker move over WebSocket without refresh.

**Satisfied** via phone *or* `npm run demo:drive` with admin `/live` open.

## Sprint 9 — Admin depth (v2)

1. [x] Deliveries page + create / assign / cancel
2. [x] Driver list endpoint + live trail polyline
3. [x] Assign delivery (existing race-safe API)
4. [x] `demo:drive` GPS simulator for portfolio demos
5. [x] Commit + push `feat/sprint-9-admin-depth`

## Sprint 10 — Production polish (v3) ← current

1. [x] Error/empty/loading states (admin deliveries + mobile list)
2. [ ] Performance pass (lists + map) — light; FlatList already in place
3. [x] Unit/integration tests (API pytest smoke)
4. [x] CI + ESLint + README polish
5. [x] Commit + push `feat/sprint-10-polish`

## Local / remote

- Local path: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Current branch: `feat/sprint-10-polish`
