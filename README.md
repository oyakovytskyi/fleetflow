# FleetFlow

Realtime fleet / courier tracking — Expo driver app, FastAPI + Redis, Next.js admin live map.

> Portfolio / interview pet project. Not commercial experience.

## Architecture

```
React Native (Expo) ──REST──▶ FastAPI ──▶ PostgreSQL
        │                      │
   foreground GPS              └── Redis (last location + pub/sub)
        │                             │
        └──────── WebSocket ◀─────────┘
                                      │
                           Next.js Admin live map
```

## Monorepo

Turborepo + npm workspaces.

| Path | Role |
| --- | --- |
| `apps/mobile` | Expo SDK 57 driver app (Expo Go) |
| `apps/admin` | Next.js live map + counts |
| `apps/api` | FastAPI JWT, deliveries, tracking, WS |
| `packages/shared-types` | Shared DTOs / WS events |
| `packages/config` | Shared TSConfig |
| `PLAN.md` | Sprint backlog |

## Quick start

```bash
# 1) Install
npm install

# 2) API + Postgres + Redis
docker compose up -d

# 3) Mobile (Expo Go SDK 57) — set LAN IP for a physical phone
#    apps/mobile/.env → EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000
npm run mobile

# 4) Admin live map
npm run admin
# → http://localhost:3000
```

Register an admin once (or use the seeded local account if you already created it):

```bash
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleetflow.dev","password":"password123","name":"Admin","role":"ADMIN"}'
```

**Demo path:** Admin → “Seed Prague demo delivery” → phone claims/starts job → GPS shares → admin marker moves. Map routes follow OSM roads via OSRM (free, no API key).

## Commands

```bash
npm run mobile      # Expo
npm run admin       # Next.js :3000
npm run api         # docker compose up api
npm run typecheck
```

## MVP status

Done: JWT auth, deliveries, OSM/Leaflet maps + **road routing (OSRM)**, foreground GPS → Redis, WebSocket admin live map.

Later (v2+): offline queue, background GPS (needs EAS build), CI/EAS polish.

See `PLAN.md` and `memory-bank/progress.md`.
