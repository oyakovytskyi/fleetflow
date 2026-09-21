# Active Context

## Current focus

Branch: **`feat/sprint-6-realtime`** — Sprint 6 is **committed** locally.
Next planned work: **Sprint 7 offline** (NetInfo + location queue + flush), then push when ready.

## Recent decisions

- Map: Leaflet + OSM; **OSRM** road routes (driver→dest when tracking).
- Admin map tiles: plain OSM (Carto free tier started requiring an API key).
- WS `/ws/live` for DRIVER + ADMIN; location frames admin-only; delivery.* filtered.
- Notifications: local (`expo-notifications`) + browser Notification API; remote push is v2.
- Dev admin: `admin@fleetflow.dev` / `password123`.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branch: `feat/sprint-6-realtime` (ahead of remote if tracking)

## Next steps

1. Push `feat/sprint-6-realtime` (and earlier feature branches if needed).
2. Optional E2E: seed → claim/start → admin marker.
3. Sprint 7: network detection + offline location queue + flush on reconnect.

## Open questions

- Rename folder `reactnative` → `fleetflow`?
