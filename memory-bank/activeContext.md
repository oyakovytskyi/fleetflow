# Active Context

## Current focus

Mobile auth UI is live: login/register screens, SecureStore session hydration, and auth-gated
routing. Expo is running (`npm run mobile` → Metro on `:8081`). API still on `:8000`.

Next — deliveries API + mobile list/detail, or verify register/login on the physical device.

## Recent decisions

- Auth screens live under `app/(auth)`; domain UI in `src/features/auth`.
- Root layout hydrates once via `useSessionHydration`, then redirects between `(auth)` and `(tabs)`.
- Mobile `.env` uses LAN IP `http://192.168.0.171:8000` (gitignored) so Expo Go on a phone can reach Docker.
- Tokens stay in SecureStore; Redux only holds `user` + `isHydrated`.
- Small commits: one task/feature per commit.

## Environment

- Expo Go **SDK 57** on device; Metro at `http://localhost:8081`.
- API: `docker compose up` → `http://192.168.0.171:8000` (and localhost).
- Phone and PC must be on the same Wi‑Fi for LAN mode.

## Next steps

1. On device: open Expo Go → scan QR / enter `exp://192.168.0.171:8081` → register a driver → confirm Home/Profile.
2. Delivery model + CRUD/status endpoints.
3. Mobile deliveries list/detail.
4. Scaffold Next.js admin.
5. ESLint for the turbo `lint` task.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
