# Research: Refactor Client for Progressive Enhancement

## Decision: Serve report steps as server-rendered HTML pages

**Rationale**: The constitution and feature requirements require meaningful HTML and standard forms
for every reporting step, ordinary document navigation, and no SPA behavior. Rendering each step on
the existing single Express application satisfies those constraints without adding another deployable.

**Alternatives considered**:

- Keep the React SPA and add a separate no-JavaScript flow: rejected because it creates two reporting
  paths that can diverge and does not meet the decision to remove reporting-page JavaScript.
- Retain the SPA with client-side routing: rejected by the constitution and FR-008.
- Add a separate frontend service: rejected because a single deployable is the architecture default.

## Decision: Render report HTML with framework-free TypeScript view functions

**Rationale**: The feature explicitly removes every React dependency. Small server-side TypeScript
view functions can compose semantic HTML without a client runtime, JSX transform, renderer, or
template-engine dependency. A shared escaping helper will encode every dynamic text and attribute
value before it enters HTML; view functions will render all error, recovery, and outcome pages.

**Alternatives considered**:

- React server rendering without hydration: rejected because it retains `react`, `react-dom`, React
  types, and JSX tooling after the requested dependency removal.
- A new server template engine: rejected because it adds a dependency and abstraction where compact
  view functions and explicit escaping meet the current scope.
- Hand-built unescaped HTML strings: rejected because draft values, errors, and upstream summaries
  require systematic output escaping.

## Decision: Use a short-lived, in-memory server-side session for report drafts

**Rationale**: A report draft contains location and description data that must survive ordinary
multi-page navigation without appearing in URLs, browser storage, or client logs. The application is
a single Node.js deployable, so an in-memory session store is sufficient for the explicitly limited
five-minute lifetime. The session expires after five minutes of inactivity and is removed on
cancellation and terminal outcomes.

**Alternatives considered**:

- Hidden fields: rejected because they expose draft information in page source and request bodies on
every transition and make state tampering harder to control.
- Browser storage: rejected by FR-009 and the constitution's confidentiality requirements.
- Shared external session store: rejected because it adds infrastructure without a scale or availability
requirement that justifies it.

## Decision: Keep automatic geolocation as the sole optional JavaScript enhancement

**Rationale**: The clarified specification permits JavaScript only to obtain browser location. A
small location-page script can populate the same latitude/longitude form submitted by the manual
fallback. It must not render pages, retain draft data, route navigation, or prevent manual entry.

**Alternatives considered**:

- No JavaScript at all: rejected by the clarification that retains browser location as a convenience.
- Keep the existing client application for geolocation: rejected because it reintroduces the SPA and
client-side state management.

## Decision: Protect session-backed form submissions with an opaque cookie and per-session CSRF token

**Rationale**: Server-side draft state makes cross-site form submissions a risk. An opaque session
identifier in an `HttpOnly`, `SameSite=Lax` cookie limits script access, and a token embedded in each
same-origin form lets the server reject forged state-changing requests. The token and cookie are
short-lived with the draft.

**Alternatives considered**:

- Rely on CORS: rejected because CORS does not protect ordinary cross-site form posts.
- Put state in a signed browser token: rejected because report location and description must remain
server-side.

## Decision: Preserve existing JSON API endpoints and add browser-facing report routes

**Rationale**: Existing API endpoints and server tests continue to represent current service
behavior. Browser pages need an HTML contract rather than JSON responses, so the new report routes
will coexist with the API during this refactor. The report-page flow invokes the existing domain and
service logic so validation, rate limiting, and upstream integrations remain consistent.

**Alternatives considered**:

- Replace the API routes: rejected because it risks breaking current consumers and unnecessarily
expands this refactor.
- Have pages call the JSON API from browser JavaScript: rejected because it violates the no-JavaScript
reporting flow.
