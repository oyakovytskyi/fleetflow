# FleetFlow Admin

Thin Next.js dashboard for live driver locations (OSM/Leaflet + WebSocket).

## Run

```bash
# from monorepo root (API must be up)
npm run admin
```

Open http://localhost:3000 — sign in with an **ADMIN** account.

Local demo account (if registered):

- email: `admin@fleetflow.dev`
- password: `password123`

## Features

- JWT login (ADMIN role required)
- Live OSM/Carto map via Leaflet
- WebSocket `/ws/live?token=…` for `driver.location.updated`
- Delivery status counts + “Seed Prague demo delivery”
- Responsive layout; map recenter after pan/zoom
