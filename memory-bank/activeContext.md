# Active Context

## Current focus

Branch: **`feat/sprint-5-tracking`**. Implementing Sprint 5 — foreground GPS
(`watchPositionAsync` → `POST /tracking/location` → Redis last-known + map live marker).

## Recent decisions

- Map uses free Leaflet + Carto/OSM WebView (no Google key).
- Theme tokens: brand tint in light/dark; `muted` / `border` / `surface` / `danger` / `success` / `onTint`.
- Tracking starts when driver starts a delivery (and resumes if already `IN_PROGRESS`).
- Location posts are best-effort in foreground; offline queue is Sprint 7.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branches: `feat/sprint-4-maps`, `feat/sprint-5-tracking` (current)

## Next steps

1. Finish tracking API + mobile wiring; typecheck; commit.
2. Verify: start delivery → GPS on → map “You” marker moves / API accepts posts.
3. Sprint 6: WebSocket fan-out + admin live map.

## Open questions

- Keep local folder name `reactnative` vs rename to `fleetflow`?
