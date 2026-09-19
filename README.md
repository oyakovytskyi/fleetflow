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

Mobile (Expo SDK 57) runs in Expo Go; API and admin are still placeholder workspaces.
See `memory-bank/progress.md`.
