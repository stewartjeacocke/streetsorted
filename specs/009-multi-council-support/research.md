# Research: Multi-Council Love Clean Streets Support

## Decision: Use a configured MapIt geographic authority lookup as the sole routing authority

**Rationale**: The clarified specification requires a third party—not resident selection and not a
Love Clean Streets submission response—to decide which council covers a coordinate. MapIt supports
point-to-area lookups for UK administrative boundaries, allowing the service to resolve a latitude
and longitude before it contacts a council reporting service. The application will treat the lookup
result as authoritative only when it maps to one active council profile.

The lookup is isolated behind an application service and adapter. Its base address and any access
credential are runtime configuration; the credential is never sent to browsers or logs. The adapter
sends only latitude and longitude, as required by FR-018.

**Alternatives considered**:

- Resident-selectable council list: rejected by clarification Q1.
- A council reporting service deciding during submission: rejected by clarification Q3 because it
  cannot safely route the resident before nearby-report lookup or submission.
- Locally maintained council boundary geometry: rejected by clarification Q3 because the third-party
  lookup must be the sole authority.

## Decision: Keep a validated, versioned council profile catalogue

**Rationale**: The reporting process differs by council in at least its Love Clean Streets destination,
fly-tipping category identifier, and potentially its nearby-report source. A committed catalogue
makes the supported set reviewable, testable, and safe to deploy in the existing single process. It
contains no geographic boundaries: it maps an authority identifier returned by MapIt to the
council-specific reporting details.

A profile becomes active only after an automated compatibility check verifies the anonymous report
form and the council-specific nearby and fly-tipping mappings. A stale, invalid, or disabled profile
is never eligible for routing.

**Alternatives considered**:

- Discovering councils and category identifiers on every resident request: rejected because it adds
  unreliable external discovery to the critical reporting path and makes the supported set
  unreviewable.
- One environment-variable target per deployment: rejected because it preserves the existing
  single-council limitation.
- Storing profiles in a new database or separate management service: rejected because the catalogue
  is deployment configuration and the constitution requires a single deployable by default.

## Decision: Resolve council assignment during the existing location submission

**Rationale**: The resident already provides a location before nearby lookup. The location form
submission will validate coordinates, call the geographic authority lookup, map the returned
authority to an active council profile, and only then advance to the nearby-report step. This retains
the existing server-rendered, standard-form workflow.

A successful assignment is stored with the report draft. Changing the location clears the previous
assignment, description, and nearby result before a new assignment is created. All subsequent
nearby and submission operations receive the stored profile instead of global single-council values.

**Alternatives considered**:

- Adding a new client-side routing step: rejected by the constitution's progressive-enhancement
  principle.
- Delaying routing until final submission: rejected because nearby-report results must belong to the
  routed council.

## Decision: Use explicit routing outcomes and fail closed

**Rationale**: The lookup service can return an authority that has no active profile, no authority,
ambiguous data, invalid data, or a temporary failure. The application represents these separately:

- **assigned**: exactly one active profile matches; advance to nearby reports.
- **unsupported**: no active supported profile matches; show a clear location-form error and allow
  correction or exit.
- **unavailable**: the lookup cannot be completed safely; retain the submitted coordinate values,
  show a temporary-unavailable message, and allow retry or exit.

No nearby lookup or council submission occurs for unsupported or unavailable routing outcomes. A
later out-of-area response from the council is treated as a failed safe outcome: the resident is not
told that the report was submitted and must resolve the location again.

**Alternatives considered**:

- Fall back to a manual council selector: rejected by clarification Q5 option C.
- Continue using the previous assignment after a location change or routing failure: rejected because
  it could send a report to the wrong authority.

## Decision: Make Love Clean Streets operations profile-aware

**Rationale**: The current integration is configured for one target and one fixed fly-tipping category
identifier. The submission and nearby-report adapters will instead accept the assigned council
profile. Profile values supply the council target, category mapping, and nearby-report source. The
existing anonymous-session, form-token, response-classification, nearby filtering, and safe
unconfirmed-submission behavior remain in place.

Resident messages derive from the assigned profile's display name rather than a hard-coded council
name. Unknown or malformed target output continues to be classified as unconfirmed.

**Alternatives considered**:

- A separate adapter and route set per council: rejected because it duplicates behavior and makes
  consistent safety guarantees difficult.
- Assume a shared fly-tipping category identifier: rejected because the feature explicitly supports
  council-specific category mappings.

## Decision: Preserve data minimization and existing security controls

**Rationale**: The routing adapter sends only coordinates to the geographic authority provider. The
profile catalogue contains public service destinations and identifiers; any provider credential is
runtime-only configuration. Existing CSRF protection, secure report-session cookies, rate limiting,
request-body limits, and log-sanitization rules remain applicable.

**Alternatives considered**:

- Send the report description, session id, or accuracy measurement to improve routing: rejected by
  clarification Q4 and unnecessary for point-to-authority routing.
