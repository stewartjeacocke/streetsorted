# Research: Display Nearby Location

## Decision: Format coordinates only at the nearby-report presentation boundary

**Rationale**: Existing state retains the full browser-provided values needed by the nearby lookup.
Formatting with five decimal places in the component gives residents readable context while ensuring
the lookup continues to receive full precision.

**Alternatives considered**:

- Replace stored coordinates with rounded values: rejected because it would reduce lookup precision.
- Add formatted coordinates to backend responses: rejected because the backend already receives full
  location input and the display is frontend-only context.

## Decision: Render only when current location exists

**Rationale**: The nearby component is reached only after a successful location acquisition. Guarding
its location display against a null value ensures failed, reset, and cancelled flows show no stale
values.

**Alternatives considered**:

- Cache the previous display values: rejected because report-flow state must be transient.
