# Active Context

## Current focus

Branch: **`feat/sprint-10-polish`**. Shipping production polish: ESLint, GitHub Actions CI, API smoke tests, empty/loading UX.

## Recent decisions

- Shared ESLint flat config in `@fleetflow/config/eslint.base.mjs`.
- CI runs `typecheck`, `lint`, and API `pytest` (no live DB required for smoke).
- Admin deliveries page has explicit loading / error / empty states with retry.
- MVP DoD remains satisfied via `npm run demo:drive`.

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branch: `feat/sprint-10-polish`

## Next steps

1. Finish Sprint 10 commit + push.
2. Optional EAS background build (manual).
3. Optional phone E2E smoke against LAN API.

## Open questions

- Rename folder `reactnative` → `fleetflow`?
