# FleetFlow — Implementation Plan

## Goal

Ship a credible pet-project fleet tracker that demonstrates Expo RN maps/GPS, JWT, WebSockets, and an admin live map.

## Architecture snapshot

```
React Native (Expo) ──REST/WS──▶ FastAPI ──▶ PostgreSQL
                                   │
                                   └── Redis (last location + trail + pub/sub)
                                          │
Next.js Admin ◀──────────WS───────────────┘
```

## Status

**Production look / main flow complete** on `feat/sprint-10-polish`.

| Area | Status |
| --- | --- |
| Auth → deliveries → GPS → admin live | Done |
| Offline queue + BG GPS scaffold | Done (EAS build manual) |
| Admin ops UI (create / assign / live) | Done |
| CI / ESLint / API smoke tests | Done |
| Demo/dummy UX removed from product UI | Done |

## Definition of done (MVP)

Driver logs in, starts a delivery, shares GPS; operator sees the marker move over WebSocket.

**Satisfied** via phone *or* `npm run demo:drive`.

## Optional later

- [ ] Phone E2E against LAN API
- [ ] `eas build --profile development` for background GPS
- [ ] Trip history beyond Redis trail
- [ ] Remote push notifications
- [ ] Alembic migrations

## Local / remote

- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branch: `feat/sprint-10-polish`
