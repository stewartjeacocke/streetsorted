# Research: Postcode Location Input

## Decision: Use `node-postcodes.io` version 1.0.3 through a dedicated adapter

**Rationale**: The requested package wraps the Postcodes.io postcode lookup and reverse-geocoding
operations needed by this feature. Its `lookup(postcode)` operation returns the canonical postcode
and coordinates for a full postcode. Its `geo(latitude, longitude, options)` operation returns nearby
postcodes for a browser-provided current position. Confining the CommonJS, untyped package to one
adapter preserves strict TypeScript types and makes provider behavior independently testable.

**Alternatives considered**:

- Call the Postcodes.io HTTP API directly: rejected because the requested package is the selected
  integration.
- Continue accepting resident-supplied coordinates: rejected by the feature specification.
- Add a map or pin-placement interface: rejected because a full postcode is the clarified location
  input and the constitution prohibits an SPA-style solution.

## Decision: Resolve submitted full postcodes on the server before existing routing

**Rationale**: Existing council routing, nearby-report lookup, and target submission already use an
`IncidentLocation` with latitude and longitude. Server-side postcode resolution translates the
resident's selected postcode into that existing internal representation without exposing coordinates
to the resident or changing downstream contracts.

**Alternatives considered**:

- Change every downstream service to accept postcodes: rejected because the incumbent integrations
  require coordinates and this would expand scope.
- Resolve directly in the browser: rejected because it would expose the provider interaction to the
  client, complicate no-JavaScript behavior, and weaken privacy controls.

## Decision: Offer current-location prefill through an optional same-origin POST endpoint

**Rationale**: Browser geolocation is available only in the browser, while `node-postcodes.io` is a
server dependency. The existing deferred helper can request permission, then submit coordinates and
the current CSRF token in a same-origin POST body to the suggestion endpoint. The endpoint calls
reverse geocoding with a one-result limit and returns only the closest canonical postcode. If
permission, browser location, the session, CSRF validation, or reverse lookup is unavailable, the
field stays manually editable and the standard form still works.

**Alternatives considered**:

- Put latitude and longitude in a GET URL: rejected because URLs are more likely to be retained by
  request logs, browser history, intermediaries, and analytics.
- Save browser coordinates in the report draft before form submission: rejected because the feature
  requires suggestions and browser location to remain transient until the resident chooses a postcode.
- Have the script call the provider directly: rejected because it duplicates provider logic and leaks
  browser location to a third party outside the service's controlled request path.

## Decision: Treat wrapper responses as untrusted and normalize them at the adapter boundary

**Rationale**: The selected package is CommonJS and does not provide TypeScript declarations. Its
methods return provider response envelopes and convert transport failures into status/error objects.
The adapter will define local minimal response types, validate status and required result fields, and
map outcomes to `resolved`, `not-found`, or `unavailable`. It will install one small local module
declaration if TypeScript needs it.

**Alternatives considered**:

- Spread `any` or package response envelopes through routes: rejected because it undermines strict
  typing and makes provider failures hard to distinguish.
- Treat every provider failure as an invalid postcode: rejected because residents must be able to retry
  temporary outages.

## Decision: Normalize full UK postcodes and retain only the canonical display value in the draft

**Rationale**: A single canonical uppercase display string prevents inconsistent display across nearby
and review pages. The form accepts harmless casing and whitespace variations, but validation rejects
area-only, district-only, malformed, unlocatable, and unsupported inputs. `ReportDraftSession` adds a
selected postcode alongside the already-required resolved coordinate location; both remain subject to
the current draft TTL and clearing behavior.

**Alternatives considered**:

- Keep the raw input exactly as submitted: rejected because it produces inconsistent resident-facing
  display and fails the normalization requirement.
- Persist postcode beyond the draft: rejected by the feature's privacy requirements.

## Decision: Expand location redaction to include postcode data

**Rationale**: Existing logging already redacts coordinate fields. Adding `postcode` to the redaction
rule protects request fields and future structured log entries. Tests will demonstrate that no
postcode, suggestion coordinates, or resolved coordinates are emitted.

**Alternatives considered**:

- Rely on the current request logger not logging request bodies: rejected because explicit defense in
depth better satisfies the no-logging requirement.
