# Research: Submit Fly-tipping Report

## Decision: Use Jekyll with browser-native JavaScript for the static frontend

**Rationale**: The resident flow is a small static site: pages and shared layout can be rendered at
build time by Jekyll, while browser-native JavaScript requests location permission, maintains the
in-memory draft, validates the description, and calls the backend only after explicit confirmation.
This avoids a frontend runtime service and keeps the public site deployable as generated static files.

**Alternatives considered**:

- React/Vite static frontend: rejected by the explicit decision to use Jekyll.
- Server-rendered frontend: rejected because the frontend must be a separately deployable static site.

## Decision: Use one Node.js backend adapter behind a static frontend site

**Rationale**: The supplied report address redirects unauthenticated users to a login page. The
anonymous-report action creates an application session and redirects back to the report form. The
report form uses a server-issued anti-forgery token, multipart form submission, and a dynamically
loaded category selector. A Node.js backend can create and discard the target session and cookie jar
within the submission request, retrieve the required form state, and return a normalized outcome to
the static frontend. The backend restricts browser access to the deployed frontend origin.

**Alternatives considered**:

- Redirect residents to the target site: rejected because it cannot provide the specified fixed
  category, browser-location-only flow, review, validation, and normalized outcome in this feature.
- Browser-side calls directly to the target: rejected because cross-origin cookie, anti-forgery, and
  form constraints make it unreliable and expose target-session behavior to the browser.
- Serving Jekyll output from the Node.js backend: rejected because the requested architecture is one
  separately deployed frontend site and one backend service.
- Browser automation: rejected because it adds a separate execution runtime and is more brittle than
  an HTTP form adapter for a single form workflow.

## Decision: Keep the report draft only in browser memory until final submission

**Rationale**: The feature requires session-only retention and the constitution prohibits unnecessary
sensitive-data exposure. The client can hold the selected location and description until the
resident confirms. The server receives the report only in the final submit request, holds it only for
the duration needed to call the target service, and then discards it.

**Alternatives considered**:

- Database-backed drafts/history: rejected because accounts, resumption, and history are out of
  scope and persistent storage would retain location and report content.
- Server-side draft session: rejected because it expands the sensitive-data retention surface without
  delivering a required user outcome.

## Decision: Make browser location mandatory, retryable, and immutable

**Rationale**: The specification requires browser-provided location with no manual editing. The
client requests permission before the resident can continue, displays a required-location error when
permission or detection fails, and offers a retry. Submission remains disabled until a location is
available.

**Alternatives considered**:

- Typed address or map-pin editing: rejected by clarification; the detected location must be used
  without manual adjustment.
- Submission with no location: rejected because location is required to make a useful council report.

## Decision: Hard-code the standard fly-tipping category ID

**Rationale**: The backend submits category ID `16144`, which the target's current category response
labels “Dumped or flytipped waste.” This removes the category-discovery request and fulfills the
explicit requirement to use a hard-coded fly-tipping category ID. The ID is application configuration,
not a resident-selectable value, and is sent only with final submission.

**Alternatives considered**:

- Resolve the category by name at submission time: rejected by the explicit hard-coded-ID decision.
- Use the park-specific fly-tipping category: rejected because this feature uses the standard
  fly-tipping category only and does not route by location type.

## Decision: Treat target submission as unconfirmed unless an explicit outcome is returned

**Rationale**: Network interruption, markup changes, validation errors, and target-service failures
can occur after the resident confirms. The adapter returns `confirmed` only when it can identify the
target's success signal and any supplied reference; every other result is `unconfirmed` or `failed`
with a resident-safe explanation.

**Alternatives considered**:

- Assume success after sending the final form request: rejected because it can mislead residents and
  create duplicate reports when they retry.

## Decision: Test against a mock target service, not the live council service

**Rationale**: Automated tests must not generate civic reports. A mock reproduces the anonymous
session bootstrap, anti-forgery field, dynamic category response, validation response, and success /
ambiguous failure pages. A manually authorized smoke test is required before release.

**Alternatives considered**:

- Automated live-site tests: rejected because they could create unwanted reports and are vulnerable
  to rate limits and target changes.
