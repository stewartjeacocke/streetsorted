# Browser Report Flow Contract

This contract describes the server-rendered browser interface. All responses are same-origin HTML
pages with meaningful content and standard forms. Existing `/api/*` JSON endpoints remain unchanged.

## Session and form rules

- The first report page creates or resumes an opaque session cookie.
- Every state-changing form includes the session's CSRF token.
- State-changing requests reject missing, expired, invalid, or mismatched sessions/tokens with an
  understandable recovery page; they do not perform the requested action.
- No report draft fields or CSRF tokens appear in URLs.

## Page and form endpoints

| Method and path | Purpose | Required input | Success behavior |
|---|---|---|---|
| `GET /report` | Start or resume a report | None | Renders the location page with manual latitude/longitude fields and optional location helper script. |
| `POST /report/location` | Validate and save a location | CSRF token, latitude, longitude; optional accuracy | Stores a valid location, then redirects to `GET /report/nearby`; re-renders location with field errors on invalid input. |
| `GET /report/nearby` | Display duplicate-check result | Active session with valid location | Shows sanitized nearby results, no-results, or unavailable state. Missing/expired drafts receive recovery guidance. |
| `POST /report/nearby/retry` | Retry duplicate lookup | CSRF token, active location | Redirects to refreshed `GET /report/nearby`. |
| `POST /report/nearby/decision` | Record duplicate decision | CSRF token, `match` or `continue` | A match renders the no-submission outcome and clears the draft; continue redirects to `GET /report/details`. |
| `GET /report/details` | Display description form | Active session with valid location and continuing decision | Renders existing description when present; otherwise gives recovery guidance. |
| `POST /report/details` | Validate and save description | CSRF token, description | Stores valid description and redirects to `GET /report/review`; re-renders field errors on invalid input. |
| `GET /report/review` | Display report review | Active session with valid location and description | Renders location and description plus explicit confirmation and edit/cancel controls. |
| `POST /report/review/edit` | Return to details | CSRF token | Redirects to `GET /report/details`. |
| `POST /report/submit` | Submit explicitly confirmed report | CSRF token, explicit confirmation | Renders the submission outcome. Confirmed/non-retryable outcomes clear the draft; retryable outcomes expose retry action. |
| `POST /report/submit/retry` | Retry an unconfirmed submission | CSRF token, retryable active draft | Renders the next submission outcome. |
| `POST /report/cancel` | Discard a draft | CSRF token | Clears the draft and redirects to `GET /report`. |

## Optional geolocation enhancement

The `GET /report` page may include a narrowly scoped script that asks the browser for location and
writes returned values into the visible manual-location form. The resident can edit those fields and
submit the same form. Denial, failure, or absence of JavaScript leaves manual entry usable. The script
MUST NOT perform routing, fetch report data, submit a report, store draft information, or render
report steps.

## Response semantics

- Invalid input returns the relevant HTML page with field-specific feedback and safe retained inputs.
- Missing, expired, or out-of-sequence drafts return an HTML recovery page with a route back to the
  start; no submission occurs.
- Nearby lookup failures render an HTML unavailable state with retry and any allowed continue action.
- All response pages use normal document navigation; no browser-facing route falls back to a SPA
  shell.
