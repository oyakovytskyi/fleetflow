# Active Context

## Current focus

Plan is current through Sprint 3. **Next: Sprint 4 — maps.**
Repo lives locally at `C:\Users\exact\Desktop\reactnative` and on GitHub as `oyakovytskyi/fleetflow`.

## Recent decisions

- Deliveries status machine: `PENDING → ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`.
- Drivers can **claim** PENDING jobs; admins create + assign. Illegal transitions return 409.
- Mobile detail route: `app/delivery/[id].tsx` (stack outside tabs).
- Token storage probes SecureStore then falls back to AsyncStorage (Expo Go native gap).

## Environment

- API: `docker compose up` → `:8000`.
- Mobile: `npm run mobile` / Expo Go SDK 57; `.env` uses LAN IP for API (gitignored).

## Next steps

1. Sprint 4: react-native-maps + markers/polyline on Map tab.
2. Sprint 5: foreground GPS → `POST /tracking/location`.
3. Scaffold Next.js admin (Sprint 6).
4. ESLint for turbo `lint`.

## Open questions

- Keep workspace directory name `reactnative` vs rename folder to `fleetflow`? (GitHub repo can still be `fleetflow`.)
