# FleetFlow Admin

Next.js operations panel: live map, deliveries, and activity.

## Run

```bash
# from repo root — API must be up
npm run admin
```

Open http://localhost:3000 and sign in with an **ADMIN** account.

Register an admin once (API):

```bash
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password","name":"Admin","role":"ADMIN"}'
```

## Env

`NEXT_PUBLIC_API_URL` — defaults to `http://localhost:8000`.

## Features

- Live Leaflet map (WS markers, GPS trails, OSRM road plans)
- Deliveries: create, assign, cancel
- Session refresh + activity feed
