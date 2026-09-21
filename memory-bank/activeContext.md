# Active Context

## Current focus

Branch: **`feat/sprint-9-admin-depth`**. Closing the portfolio MVP loop:
admin deliveries + assign, live trails, `npm run demo:drive` simulator.

## Recent decisions

- Redis trail key `driver:{id}:trail` (LPUSH/LTRIM, last 120 points).
- Admin nav: Live map | Deliveries (assign/cancel).
- Demo driver script proves WebSocket marker motion without a physical phone.
- MVP DoD: driver GPS → admin live map (demo:drive satisfies automated proof).

## Environment

- Local: `C:\Users\exact\Desktop\reactnative`
- GitHub: https://github.com/oyakovytskyi/fleetflow
- Branch: `feat/sprint-9-admin-depth`

## Next steps

1. Commit + push Sprint 9.
2. Optional EAS background build (manual).
3. Sprint 10: ESLint / tests / CI if desired.

## Open questions

- Rename folder `reactnative` → `fleetflow`?
