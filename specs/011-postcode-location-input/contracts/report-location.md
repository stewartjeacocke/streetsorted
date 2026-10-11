# Report Location Contract

This contract defines the server-rendered postcode location flow and its optional progressive
enhancement. It does not alter existing coordinate-based downstream council, nearby-report, or
submission interfaces.

## `GET /report`

**Purpose**: Render the location entry page.

**HTML requirements**:

- A single required input named `postcode`, labelled as the incident postcode.
- A hidden CSRF field.
- No resident-facing latitude or longitude inputs or values.
- The existing deferred location helper may be included, but the form remains fully usable without it.
- Re-rendered validation or provider-failure pages retain the resident-entered `postcode` value.

## `POST /report/location`

**Purpose**: Validate a full UK postcode, resolve it, route it to a supported council, and advance the
existing flow.

**Request content type**: `application/x-www-form-urlencoded`

| Field | Required | Meaning |
|-------|----------|---------|
| `csrf` | Yes | Current draft's CSRF token. |
| `postcode` | Yes | Resident-selected full UK incident postcode. |

**Outcomes**:

| Status | Condition | Response |
|--------|-----------|----------|
| 303 | Resolved postcode belongs to a supported council | Redirect to existing `/report/nearby` or `/report/details` stage. |
| 200 | Empty, partial, or malformed postcode | Re-render location page with correction message and submitted value. |
| 404/422 | Full postcode cannot be resolved or resolves outside supported coverage | Re-render location page with corrective message and submitted value. |
| 503 | Postcode or council routing provider unavailable | Re-render location page with retry guidance and submitted value. |
| 403 | Invalid CSRF token | Existing recovery response. |
| 409 | Missing or expired draft | Existing recovery response. |

The route obtains the canonical postcode and coordinates through `PostcodeLocationService`; it records
the canonical postcode and an existing fresh `IncidentLocation` together only after successful council
assignment.

## `POST /report/location/suggestion`

**Purpose**: Optional same-origin enhancement that converts a browser-permitted current position into
the closest canonical postcode for pre-filling the location form.

**Request content type**: `application/json`

| Field | Required | Meaning |
|-------|----------|---------|
| `csrf` | Yes | Current draft's CSRF token. |
| `latitude` | Yes | Browser geolocation latitude; valid only for this suggestion request. |
| `longitude` | Yes | Browser geolocation longitude; valid only for this suggestion request. |

**Success response** — `200 application/json`:

```json
{ "postcode": "N1 9PF" }
```

**Other outcomes**:

| Status | Condition | Client behavior |
|--------|-----------|-----------------|
| 204 | No nearby full postcode or invalid position | Leave manual field unchanged. |
| 403 | Invalid CSRF token | Leave manual field unchanged. |
| 409 | Missing or expired draft | Leave manual field unchanged. |
| 503 | Provider unavailable | Leave manual field unchanged; do not block manual entry. |

**Security and privacy**:

- Coordinates are sent in the POST body, never in the URL.
- The endpoint sends `Cache-Control: no-store` and does not write coordinates or suggestions to the
  report draft.
- The helper must only set the field if it is still empty and untouched; it must never overwrite typed
  or edited resident input.
- The endpoint is not a replacement for form submission and must not create a client-side route.

## Resident-facing presentation

After a successful form submission, nearby and review pages show the canonical selected postcode as
the report's incident location. They must not render latitude or longitude.
