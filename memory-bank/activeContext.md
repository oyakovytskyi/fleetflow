# Active Context

## Current focus

Branch: **`feat/sprint-8-background`**. Sprint 8 — background GPS via TaskManager +
EAS development-build scaffold. Expo Go stays foreground-only.

## Recent decisions

- Background location uses `expo-task-manager` + `startLocationUpdatesAsync`.
- Active delivery id persisted for the background task (`STORAGE_KEYS.activeDeliveryId`).
- Expo Go detected via `Constants.appOwnership === 'expo'` → skip background APIs.
- Offline queue still receives failed background posts.
- GitHub: global `url.git@github.com:.insteadOf` rewrites HTTPS→SSH; push with
  `gh auth git-credential` against the HTTPS URL when SSH keys are missing.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Pushed: `feat/sprint-4-maps` … `feat/sprint-7-offline`
- Current: `feat/sprint-8-background`

## Next steps

1. Finish Sprint 8 commit + push.
2. Optional: `eas build --profile development` for real background GPS on device.
3. Sprint 9 admin depth.

## Open questions

- Rename folder `reactnative` → `fleetflow`?
