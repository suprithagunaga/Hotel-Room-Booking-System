# Bellcorp House Hotel Booking

A complete React and Express hotel room booking system with PostgreSQL as the transactional source of truth, MongoDB activity logging, and Redis availability caching plus booking rate limiting.

## Features

- Registration, login, bcrypt password hashing, and JWT-protected booking routes
- Fixed inventory of four rooms with premium responsive UI
- Indian Rupee pricing and persisted total amount calculated as nights x rate
- Room listing, room detail, date availability, booking history, and confirmation feedback
- `[check_in, check_out)` date semantics: checkout on the next guest's check-in date is allowed
- PostgreSQL transaction with `SELECT ... FOR UPDATE` on the room row before the overlap check
- MongoDB activity events for registration, login, successful booking, and conflicts
- Redis availability cache with 60-second TTL, best-effort invalidation, and graceful database fallback
- Redis-backed rate limiting on `POST /api/bookings`
- Zod validation, parameterized SQL, safe error responses, and paginated list queries

## Stack and architecture

- `client/`: Vite React single-page client with hash routing
- `server/`: Express controllers, services, validators, middleware, and database adapters
- `database/schema/001_init.sql`: PostgreSQL tables, constraints, and indexes
- `database/schema/002_booking_total.sql`: migration for persisted booking totals
- `database/seed/001_rooms.sql`: fixed room inventory
- PostgreSQL owns users, rooms, and bookings. MongoDB owns append-style audit data. Redis is disposable cache/rate-limit state.

## Setup

Prerequisites: Node.js 20+, Docker Desktop (recommended), and npm.

1. Start infrastructure:

```powershell
docker compose up -d
```

2. Create the schema and seed rooms:

```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d hotel_booking -f database/schema/001_init.sql
psql -h localhost -U postgres -d hotel_booking -f database/schema/002_booking_total.sql
psql -h localhost -U postgres -d hotel_booking -f database/seed/001_rooms.sql
```

Alternatively, run the SQL files in pgAdmin or another PostgreSQL client.

3. Configure the server:

```powershell
Copy-Item .env.example server/.env
```

Replace `JWT_SECRET` with a long random value. The default local Docker credentials match the example values.

4. Install dependencies:

```powershell
cd server
npm install
cd ../client
npm install
```

## Run

In one terminal:

```powershell
cd server
npm run dev
```

In another:

```powershell
cd client
npm run dev
```

Open http://localhost:5173.

## API overview

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)
- `GET /api/rooms`, `GET /api/rooms/:id`
- `GET /api/rooms/:id/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD`
- `GET /api/rooms/:id/bookings`
- `POST /api/bookings` (JWT and rate limit required)
- `GET /api/bookings/my` (JWT required)
- `GET /api/bookings/:id` (JWT required, owner only)

## Concurrency solution

Booking creation begins a PostgreSQL transaction and locks the selected active room row with `SELECT ... FOR UPDATE`. While that lock is held, the service checks:

```sql
check_in_date < requested_check_out
AND check_out_date > requested_check_in
```

A conflict returns HTTP 409 and rolls back. Otherwise the insert occurs and the transaction commits. Concurrent requests for one room serialize on that room row, so only one can pass the overlap check. The room lock is deliberately the authority; availability reads are advisory and cached.

## Testing

The client build and backend JavaScript syntax can be checked with:

```powershell
cd client; npm run build
cd ../server; Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

The live acceptance checks cover normal booking, overlapping rejection, same-day checkout/check-in, past-date rejection, and two concurrent requests. The concurrent test should report exactly one `201` and one `409`.

For a concurrent booking demonstration, create two users, obtain both login tokens, find a room UUID from `GET /api/rooms`, then send the same date range concurrently:

```powershell
$body = '{"roomId":"ROOM_UUID","checkIn":"2026-08-10","checkOut":"2026-08-12"}'
1..2 | ForEach-Object -Parallel { Invoke-RestMethod -Uri http://localhost:4000/api/bookings -Method Post -Headers @{ Authorization = "Bearer TOKEN" } -ContentType 'application/json' -Body $using:body }
```

One request succeeds with 201 and the other returns 409. A subsequent booking for `2026-08-12` to `2026-08-14` is allowed. Availability responses can be inspected in Redis with `redis-cli`, and activity documents appear in the `activitylogs` MongoDB collection.

## Known limitations

- Images use remote Unsplash URLs and require network access.
- Activity logging is intentionally best effort so an audit-store outage cannot undo a committed booking.
- Cache invalidation removes the exact queried availability key; short TTLs bound stale results, while booking creation always performs the authoritative transaction check.
- There is no cancellation or payment workflow because neither is required by the assignment.
