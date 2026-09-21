# Active Context

## Current focus

Branch: **`feat/sprint-4-maps`**. Implementing Sprint 4 — react-native-maps on the Map tab
(markers, polyline, camera helpers, wire to delivery).

## Recent decisions

- Work continues on feature branches; update `PLAN.md` + memory bank after each task.
- Maps must run in Expo Go SDK 57 (no custom native code yet).
- Deliveries status machine: `PENDING → ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`.
- Token storage: SecureStore with AsyncStorage fallback.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow (`main` + `feat/sprint-4-maps`)
- API: `docker compose up` → `:8000`
- Mobile: Expo Go SDK 57

## Next steps (this branch)

1. Install `react-native-maps` + `expo-location`; permissions in `app.json`.
2. Map feature helpers (region, markers, polyline).
3. Wire Map tab to selected / active delivery.
4. Typecheck → commit → update PLAN/progress.

## Open questions

- Keep local folder name `reactnative` vs rename to `fleetflow`?
