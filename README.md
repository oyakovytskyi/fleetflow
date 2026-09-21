# FleetFlow

Realtime fleet / courier tracking — Expo driver app, FastAPI + Redis, Next.js admin live map.

> Portfolio / interview pet project demonstrating JWT auth, maps/GPS, WebSockets, offline queue, and an operator dashboard.

## Architecture

```
React Native (Expo) ──REST──▶ FastAPI ──▶ PostgreSQL
        │                      │
   GPS (FG / BG*)              └── Redis (last location + trail + pub/sub)
        │                             │
        └──────── WebSocket ◀─────────┘
                                      │
                           Next.js Admin (live map + deliveries)
```

\* Background GPS requires an EAS development build (not Expo Go).

## Quick demo (no phone required)

```bash
npm install
docker compose up -d          # API :8000, Postgres, Redis
npm run admin                 # http://localhost:3000
# sign in: admin@fleetflow.dev / password123  (register ADMIN once if needed)

# terminal 2 — animate a driver on the live map
npm run demo:drive
```

Open **Live map** while `demo:drive` runs — marker + trail move over WebSocket.

## Full stack

| Command | What |
| --- | --- |
| `npm run api` | FastAPI via Docker |
| `npm run mobile` | Expo Go (set `EXPO_PUBLIC_API_URL` to LAN IP on a phone) |
| `npm run admin` | Next.js admin |
| `npm run demo:drive` | Simulated driver GPS |
| `npm run typecheck` | Strict TS across workspaces |

## What’s in the MVP

- JWT auth with refresh rotation (DRIVER / ADMIN)
- Deliveries claim / start / complete + admin assign
- OSM map + **OSRM road routing** (mobile)
- Foreground GPS → Redis → WebSocket admin markers
- Delivery lifecycle events + local/browser notifications
- Offline GPS queue (NetInfo + AsyncStorage flush)
- Background GPS TaskManager + EAS scaffold
- Admin: live map with trails, deliveries page, activity feed

## Monorepo

Turborepo + npm workspaces: `apps/mobile`, `apps/admin`, `apps/api`, `packages/shared-types`.

See `PLAN.md` and `memory-bank/` for sprint status.
