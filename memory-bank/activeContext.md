# Active Context

## Current focus

Branch: **`feat/sprint-7-offline`**. Implementing Sprint 7 — NetInfo + AsyncStorage
location queue + flush on reconnect.

## Recent decisions

- Offline GPS samples persist in AsyncStorage (cap 200); Redux only mirrors `pendingCount`.
- Flush is FIFO; stop on first failed POST and retry on next online transition.
- NetInfo: online when `isConnected && isInternetReachable !== false`.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branches: `feat/sprint-6-realtime` (committed), `feat/sprint-7-offline` (current)

## Next steps

1. Finish Sprint 7 wiring; typecheck; commit.
2. Push feature branches when GitHub auth works.
3. Sprint 8 background GPS needs EAS (not Expo Go).

## Open questions

- Rename folder `reactnative` → `fleetflow`?
