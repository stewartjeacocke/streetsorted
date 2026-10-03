# Research: Migrate React Frontend

## Decision: Use a Vite-built React single-page application

**Rationale**: The current resident workflow is an interactive, transient state machine with location
permission, retries, conditional nearby-report decisions, review, and outcomes. React components plus
a central hook/reducer make these transitions explicit while Vite produces static deployment assets.
The resulting frontend has no runtime Node.js server and preserves the current static-hosting model.

**Alternatives considered**:

- Retain Jekyll with additional browser modules: rejected because the user explicitly requested a
  React rewrite and Node.js-based frontend toolchain.
- Serve React from the backend: rejected because the project retains a separately deployed static
  frontend and one backend service.

## Decision: Preserve backend contracts and move only frontend state/presentation

**Rationale**: The backend already enforces origin restrictions, validation, rate limits, nearby
filtering, target-session isolation, and log redaction. The React application consumes the existing
nearby lookup and report-submission contracts, avoiding a duplicated council integration or a
backend behavior change.

**Alternatives considered**:

- Call council endpoints directly from React: rejected because it bypasses backend controls and
  exposes external payloads/session behavior to the browser.
- Redesign API responses: rejected because migration risk is lower when resident behavior is
  preserved behind stable contracts.

## Decision: Keep all report state in React memory

**Rationale**: Existing requirements require drafts, nearby reports, and duplicate decisions to be
discarded on cancellation, reset, or refresh. Reducer state in the mounted application satisfies this
without browser storage or persistence.

**Alternatives considered**:

- Use local/session storage: rejected because refresh must discard transient report state.
- Persist drafts server-side: rejected because it expands sensitive-data retention without a required
  resident outcome.

## Decision: Standardize all Node toolchains and images on Node.js 26

**Rationale**: Frontend build, backend development/runtime, test scripts, engine metadata, and Docker
images must agree on the explicitly requested Node.js 26 baseline. Ruby/Jekyll dependencies and
commands are removed from supported workflows.

**Alternatives considered**:

- Keep backend on Node.js 24: rejected because the user requested that the project move to Node.js 26.
- Keep Ruby/Jekyll as a fallback: rejected because it would create a second supported frontend path.
