# React Frontend API Contract

## Boundary

The React frontend communicates only with the existing project backend through the configured API
origin. It MUST NOT call the council service directly.

## Existing backend operations

| Operation | Existing endpoint | React behavior |
|---|---|---|
| Nearby lookup | `GET /api/nearby-reports` | Trigger after fresh location; render safe summaries, no-results, or retryable unavailable result. |
| Report submission | `POST /api/reports` | Trigger only after no-match/no-results, valid details, and explicit final confirmation. |

## Required client behavior

- Do not call report submission after a matching nearby-report decision.
- Do not retain API results in browser storage.
- Normalize malformed/non-JSON responses to existing resident-safe unavailable or unconfirmed states.
- Use the configured backend origin in development and production builds; no target-service origin is
  exposed as a frontend API destination.
