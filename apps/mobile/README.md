# Mobile app (Expo)

FleetFlow driver app — Expo Router + TypeScript (SDK 57).

## Run (Expo Go)

From monorepo root:

```bash
npm install
npm run mobile
```

Foreground GPS, maps, WS, and offline queue work in **Expo Go**.

## Background GPS (Sprint 8)

Background location requires a **development build** (not Expo Go):

```bash
cd apps/mobile
npx eas-cli login
npx eas build --profile development --platform android
# install the APK, then:
npx expo start --dev-client
```

See `eas.json` profiles: `development` / `preview` / `production`.

## Layout

```
app/                 # Expo Router screens (thin)
src/features/        # auth, deliveries, tracking, map
src/services/        # api, websocket, location queue, notifications
src/store/           # Redux slices
```
