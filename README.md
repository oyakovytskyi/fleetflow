# FleetFlow

Realtime fleet / courier tracking — Expo driver app, FastAPI + Redis, Next.js operations map.

> Portfolio project: JWT auth, maps/GPS, WebSockets, offline queue, and an operator dashboard.

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

## Quick start

```bash
npm install
docker compose up -d          # API :8000, Postgres, Redis
npm run admin                 # http://localhost:3000
npm run mobile                # Expo Go — set EXPO_PUBLIC_API_URL to LAN IP on a phone
```

Register an **ADMIN** once, then an operator can create deliveries and assign drivers:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password","name":"Admin","role":"ADMIN"}'
```

Optional GPS simulator (no phone):

```bash
npm run demo:drive
```

## Commands

| Command | What |
| --- | --- |
| `npm run api` | FastAPI via Docker |
| `npm run mobile` | Expo Go |
| `npm run admin` | Next.js operations UI |
| `npm run demo:drive` | Simulated driver GPS |
| `npm run typecheck` | Strict TS across workspaces |
| `npm run lint` | ESLint (admin + mobile) |
| `npm run test` | API pytest smoke (via Docker / CI) |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, and API unit tests on push/PR.

## What’s included

- JWT auth with refresh rotation (DRIVER / ADMIN)
- Deliveries claim / start / complete + admin assign
- OSM map + OSRM road routing (mobile + admin plans)
- Foreground GPS → Redis → WebSocket admin markers
- Delivery lifecycle events + local/browser notifications
- Offline GPS queue (NetInfo + AsyncStorage flush)
- Background GPS TaskManager + EAS scaffold
- Admin: live map with trails, deliveries, activity feed
- Driver home dashboard + auto-resume GPS for in-progress jobs

## Monorepo

Turborepo + npm workspaces: `apps/mobile`, `apps/admin`, `apps/api`, `packages/shared-types`.

See `PLAN.md` and `memory-bank/` for sprint status.
