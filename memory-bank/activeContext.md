# Active Context

## Current focus

Branch: **`feat/sprint-4-maps`**. Sprint 4 map tab is implemented (markers, polyline, picker,
current location, View on map from delivery detail). Typecheck green.

## Recent decisions

- Feature branch workflow: `feat/sprint-4-maps` off `main`; update PLAN + memory bank after each task.
- Theme: dark-mode `tint` is brand blue (not white) so primary buttons stay readable; tokens include
  `muted`, `border`, `surface`, `danger`, `success`, `onTint`.
- Map prefers Redux `deliveries.selectedDeliveryId`, then tracking `activeDeliveryId`, then smart pick.
- Straight-line polyline only (no directions API yet).
- `expo-location` foreground permission for “You” marker.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branch: `feat/sprint-4-maps`

## Next steps

1. Push branch / open PR when ready.
2. Sprint 5: foreground GPS watch + `POST /tracking/location`.
3. Scaffold Next.js admin (Sprint 6).

## Open questions

- Keep local folder name `reactnative` vs rename to `fleetflow`?
