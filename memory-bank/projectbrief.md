# FleetFlow — Project Brief

## What it is

**FleetFlow** is a mini fleet / courier tracking platform: drivers track deliveries on mobile with GPS; operators watch the fleet live on an admin map.

## Why it exists

Pet project to demonstrate React Native (Expo) skills for a mobile vacancy: maps, GPS, background location, WebSockets, offline-first sync, JWT auth, and realtime admin tracking — presented as project experience, not commercial work.

## Scope

| Layer | Responsibility |
| --- | --- |
| `apps/mobile` | Expo RN driver app: auth, deliveries, map, GPS, offline queue |
| `apps/admin` | Next.js operator panel: live map, drivers, deliveries |
| `apps/api` | FastAPI: REST, JWT, WebSocket, Postgres, Redis |
| `packages/shared-types` | Shared DTOs, enums, WS event contracts |

## MVP v1 (must ship first)

Authentication → Deliveries CRUD/list → Map markers/polyline → Foreground GPS → WebSocket location events → Admin live map.

## Explicitly later (v2+)

Background location (dev build), offline queue, Redis pub/sub hardening, route history, push notifications, Firebase analytics (optional), performance pass, tests, Docker/CI, EAS profiles.

## Non-goals (MVP)

- Full logistics ERP, billing, customer app, multi-tenant SaaS
- Firebase as primary backend
- Over-engineering admin UI (keep ~20% effort; focus on mobile)
