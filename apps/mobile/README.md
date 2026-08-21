# Mobile app (Expo)

FleetFlow driver app — Expo Router + TypeScript.

## Run

From monorepo root:

```bash
npm install
npm run mobile
```

Or:

```bash
cd apps/mobile
npx expo start
```

## Layout

```
app/                 # Expo Router screens (thin)
  (tabs)/            # Home, Deliveries, Map, Profile
src/
  features/          # auth, deliveries, tracking, map, profile
  hooks/
  services/
  store/
  types/
  constants/
components/          # Expo template UI helpers (Themed, etc.)
constants/           # Colors theme tokens
```

## Status

Scaffold only — Redux, TanStack Query, maps, and GPS come in later Sprint 1–5 commits.
