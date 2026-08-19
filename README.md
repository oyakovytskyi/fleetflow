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

```
apps/mobile              Expo driver app
apps/admin               Next.js operator panel
apps/api                 FastAPI + WS
packages/shared-types    Shared DTOs / events
memory-bank/             AI/session project memory
.cursor/rules/           Cursor project rules
PLAN.md                  Sprint plan
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

Bootstrap only — app generators not run yet. See `memory-bank/progress.md`.
