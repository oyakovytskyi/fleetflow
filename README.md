# FleetFlow

Realtime fleet / courier tracking platform — React Native (Expo), FastAPI, WebSockets, Next.js admin.

> Pet project for portfolio/interview use. Not commercial experience.

## Architecture

```
              ┌───────────────┐
              │ React Native  │
              │    Expo       │
              └───────┬───────┘
                      │ REST / WebSocket
                      ▼
              ┌───────────────┐
              │    FastAPI    │
              └───────┬───────┘
             ┌────────┴────────┐
             ▼                 ▼
       PostgreSQL            Redis
             │                 │
             └────────┬────────┘
                      ▼
                ┌───────────┐
                │  Next.js  │
                │   Admin   │
                └───────────┘
```

## Monorepo

Turborepo over npm workspaces.

```
apps/mobile              Expo driver app
apps/admin               Next.js operator panel
apps/api                 FastAPI + WS
packages/shared-types    Shared DTOs / events
packages/config          Shared tsconfig preset
memory-bank/             AI/session project memory
.cursor/rules/           Cursor project rules
turbo.json               Task graph
PLAN.md                  Sprint plan
```

## Commands

Run everything from the repo root:

```bash
npm install
npm run mobile      # expo start (scan QR with Expo Go SDK 57)
npm run typecheck   # tsc --noEmit in every workspace, cached
npm run lint
npm run build
npm run test
```

## MVP features

- JWT auth with refresh + SecureStore
- Deliveries list/detail + status flow
- Map markers + polyline
- Foreground GPS tracking
- WebSocket live admin map

## Docs for agents / humans

- Start: `memory-bank/INDEX.md`
- Plan: `PLAN.md`
- Decisions: `memory-bank/systemPatterns.md`

## Status

Through **Sprint 3**: mobile auth + deliveries (list/detail/claim/start/complete), FastAPI JWT +
deliveries API via Docker. Next: Sprint 4 maps. Admin Next.js still a placeholder.
See `PLAN.md` and `memory-bank/progress.md`.
