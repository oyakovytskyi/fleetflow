# FleetFlow API

FastAPI backend for auth, deliveries, tracking, and WebSockets.

## Run (Docker)

From the monorepo root:

```bash
docker compose up --build
# or: npm run api
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Auth endpoints (Sprint 2)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | Returns `{ user, tokens }` (camelCase) |
| POST | `/auth/login` | Same shape |
| POST | `/auth/refresh` | Flat `{ accessToken, refreshToken }`; rotates + detects replay |
| GET | `/auth/me` | Bearer access token |
| POST | `/auth/logout` | Revokes the presented refresh token |

## Layout

```
app/
  api/routes/     # FastAPI routers
  services/       # domain logic
  repositories/   # SQLAlchemy queries
  models/         # ORM
  schemas/        # Pydantic (camelCase wire format)
  core/           # config, JWT, errors
  db/             # engine + session
```

Schema is created on boot for MVP (`create_all`). Alembic comes later.
