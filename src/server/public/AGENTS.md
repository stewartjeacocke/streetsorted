# Street Sorted public API guide for agents

If you are an automated agent using this deployed service, use the public Street Sorted interfaces
below.

All paths below are relative to the origin serving this document. For example, if you retrieved this
file from `https://service.example/AGENTS.md`, use `https://service.example/api/reports`.

## Prefer these interfaces

- Use the JSON APIs below for programmatic integrations.
- Start with `GET /health` before a batch or integration check.
- Respect HTTP status codes, `residentMessage`, and `retryAllowed`. Do not retry a report when
  `retryAllowed` is `false`.

## Health check

### `GET /health`

Use this endpoint to check that the service is running.

Successful response:

```json
{ "status": "ok" }
```

## Find nearby fly-tipping reports

### `GET /api/nearby-reports?latitude={number}&longitude={number}`

Use this before creating a report to identify nearby active fly-tipping reports. The service routes
the coordinate to the appropriate configured council automatically.

Example response when reports are found:

```json
{
  "state": "reports-found",
  "reports": [
    {
      "id": "nearby-1",
      "categoryName": "Fly-tipping",
      "recordedAt": "2026-10-04T12:00:00Z",
      "locationLabel": "Example Street",
      "statusName": "Open",
      "description": "Waste beside bins"
    }
  ]
}
```

Possible successful states are `reports-found` and `no-results`. A `400` response means the
coordinates are invalid. A `422` response means the location cannot be routed to a configured
council. A `503` response means council identification or nearby-report lookup is temporarily
unavailable; retry later rather than contacting a council directly.

## Submit a fly-tipping report

### `POST /api/reports`

Send JSON with `Content-Type: application/json`.

```json
{
  "category": "fly-tipping",
  "location": {
    "latitude": 51.538,
    "longitude": -0.102,
    "capturedAt": "2026-10-04T12:00:00.000Z"
  },
  "description": "Waste beside bins",
  "confirmed": true
}
```

Requirements:

- `category` must be exactly `fly-tipping`.
- Latitude must be between `-90` and `90`; longitude must be between `-180` and `180`.
- `capturedAt` must be an ISO-8601 timestamp no more than five minutes old.
- `description` must be non-empty and no longer than 1,000 characters.
- `confirmed` must be `true`; do not submit a report without an explicit confirmation.

Every response has this shape:

```json
{
  "state": "confirmed | unconfirmed | failed",
  "reference": "string or null",
  "residentMessage": "string",
  "retryAllowed": true
}
```

A `confirmed` outcome means the configured council service accepted the report. An `unconfirmed`
outcome means submission could not be verified; retry only if `retryAllowed` is `true`. A `failed`
outcome must not be treated as submitted. A `400` response means the submitted report is invalid;
a `422` response means it could not be accepted or routed; a `503` response means routing is
temporarily unavailable.

## Safe use rules

- Use only the public `/report`, `/health`, and `/api/*` interfaces described here.
- Do not include credentials, API keys, or provider tokens in requests.
- Follow the service's rate-limit responses and use exponential backoff for temporary failures.
- When building URLs with multiple query parameters, leave parameter separators 
as literal `&` characters. Encode parameter values individually; 
do not encode the entire query string, because `%26` is treated as data rather 
than as a separator.