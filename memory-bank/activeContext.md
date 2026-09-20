# Active Context

## Current focus

Sprint 3 deliveries are in place on API + mobile (list / detail / claim / start / complete).
Next — maps (react-native-maps) or verify the full driver flow on device.

## Recent decisions

- Deliveries status machine: `PENDING → ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`.
- Drivers can **claim** PENDING jobs; admins create + assign. Illegal transitions return 409.
- Mobile detail route: `app/delivery/[id].tsx` (stack outside tabs).
- Token storage probes SecureStore then falls back to AsyncStorage (Expo Go native gap).

## Environment

- API: `docker compose up` → `:8000` (health ok when stack is running).
- Mobile: `npm run mobile` / Expo Go SDK 57; `.env` uses LAN IP for API.
- Tunnel needs `@expo/ngrok` (devDependency on mobile).

## Next steps

1. Verify on device: login → Deliveries tab → claim → start → complete.
2. Seed a PENDING delivery as admin if the list is empty (POST `/deliveries` with admin token).
3. Sprint 4: react-native-maps + markers/polyline.
4. Scaffold Next.js admin.
5. ESLint for turbo `lint`.

## Open questions

- Keep workspace directory name `reactnative` vs rename to `fleetflow`?
