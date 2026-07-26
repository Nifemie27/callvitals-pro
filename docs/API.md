# CallVitals Pro API Reference

Base URL: `http://localhost:4000/api` in local dev, `/api` behind the frontend's nginx proxy in Docker.

All responses share one envelope:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "pagination": null,
  "timestamp": "2026-07-26T12:00:00.000Z"
}
```

Error responses set `success: false`, `data: null`, and a human-readable `message`. Validation errors additionally include an `errors` array of `{ field, message }`.

Every endpoint except `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/health` requires an `Authorization: Bearer <accessToken>` header.

## Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account (always role `ANALYST`). Rate-limited. Returns tokens and auto-signs in. |
| POST | `/auth/login` | Public | Exchange email + password for tokens. Rate-limited. |
| POST | `/auth/refresh` | Refresh cookie | Rotates the refresh token and issues a new access token. Reusing an already-rotated token revokes every session for that user. |
| POST | `/auth/logout` | Refresh cookie | Revokes the current refresh token and clears the cookie. |
| GET | `/auth/me` | Bearer | Returns the current user's profile. |

The access token is returned in the JSON body (15 minute default lifetime) and is expected to be kept in memory by the client. The refresh token is set as an `httpOnly`, `SameSite` cookie scoped to `/api/auth` (7 day default lifetime) and is never exposed to JavaScript.

**Password rules:** minimum 8 characters, at least one uppercase letter, one lowercase letter, and one digit.

## Call records

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/calls` | Any | Paginated, filtered, sorted list. |
| GET | `/calls/:id` | Any | Single record. |
| POST | `/calls` | Admin | Create a record. |
| PATCH | `/calls/:id` | Admin | Partial update. |
| DELETE | `/calls/:id` | Admin | Delete a record. |
| GET | `/calls/export/csv` | Any | Streams every record matching the filters as CSV. |
| GET | `/calls/export/pdf` | Any | Streams a paginated PDF report (summary + up to 2,000 rows) matching the filters. |

### Query parameters (list and export endpoints)

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default 1. List endpoint only. |
| `limit` | integer | Default 20, max 100. List endpoint only. |
| `sort` | string | `field:direction`, e.g. `startTime:desc`. Fields: `startTime`, `durationSeconds`, `cost`, `city`, `callerName`. |
| `search` | string | Matches caller name, caller number, receiver number, or city. |
| `dateFrom` / `dateTo` | ISO date | Inclusive range on `startTime`. |
| `caller` / `receiver` | string | Substring match on the respective phone number. |
| `city` | string | Exact match, case-insensitive. |
| `direction` | `INBOUND` \| `OUTBOUND` | |
| `status` | `SUCCESS` \| `FAILED` | |
| `minDuration` / `maxDuration` | integer (seconds) | |

### Request body (create / update)

```json
{
  "callerName": "string",
  "callerNumber": "string",
  "receiverNumber": "string",
  "city": "string",
  "direction": "INBOUND | OUTBOUND",
  "status": "SUCCESS | FAILED",
  "durationSeconds": 0,
  "cost": 0,
  "startTime": "ISO 8601",
  "endTime": "ISO 8601 (must be after startTime)"
}
```

`PATCH` accepts any subset of the same fields.

## Analytics

All analytics endpoints accept the same filter query parameters as `/calls` (minus `page`/`limit`/`sort`), scoping the aggregation to a subset of records. Available to both roles (read-only for `ANALYST`).

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/summary` | Total calls, total/average duration, inbound/outbound counts, success/failure counts and rate, total cost. |
| GET | `/analytics/top-callers` | Top callers by call count. `limit` param, default 10, max 50. |
| GET | `/analytics/call-distribution` | Direction and status breakdown with percentages. |
| GET | `/analytics/calls-per-day` | Daily call count and total duration across the filtered range. |
| GET | `/analytics/calls-per-city` | Top N cities (`limit`, default 15, max 50) plus an honest "Other" aggregate for the long tail. `sortBy=count\|cost` (default `count`). |
| GET | `/analytics/trends` | Current vs. previous period totals and percentage change. Period defaults to the last 30 days if `dateFrom`/`dateTo` aren't provided. |

## Users (admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/users` | Paginated list. `search`, `role` query params. |
| GET | `/users/:id` | Single user. |
| PATCH | `/users/:id` | Update `role` and/or `isActive`. An admin cannot change their own role or deactivate their own account. Deactivating a user revokes all of their refresh tokens immediately. |
| DELETE | `/users/:id` | Delete a user. An admin cannot delete their own account. |

## Audit logs (admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/audit-logs` | Paginated audit trail. `userId`, `action` query params. Includes the actor's id/email/name where available. |

Logged actions: `USER_REGISTER`, `USER_LOGIN`, `USER_LOGIN_FAILED`, `USER_LOGOUT`, `USER_ROLE_CHANGED`, `USER_DEACTIVATED`, `USER_DELETED`, `CALL_CREATED`, `CALL_UPDATED`, `CALL_DELETED`, `CALLS_EXPORTED_CSV`, `CALLS_EXPORTED_PDF`.

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check (used by Docker healthchecks). Not under `/api`. |

## Status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no body (delete) |
| 400 | Malformed request (e.g. endTime before startTime) |
| 401 | Missing/invalid/expired token, or bad credentials |
| 403 | Authenticated but not authorized for this action |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 422 | Validation failed (see `errors` array) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Example: login then fetch filtered calls

```bash
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@callvitals.dev","password":"Admin123!Change"}'

# copy the accessToken from the response, then:
curl "http://localhost:4000/api/calls?city=London&status=FAILED&page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"
```
