# Research: Filter Nearby Reports

## Decision: Filter with the existing fly-tipping category constant

**Rationale**: The report-submission feature already fixes fly-tipping to category ID `16144`. A
nearby report qualifies only when its target `CategoryId` equals that same value. This is more
reliable than matching a human-readable category label, which can vary by authority or wording.

**Alternatives considered**:

- Match category names containing “fly-tipping”: rejected because labels can vary and may cause a
  non-fly-tipping report to appear as a duplicate.
- Expose category selection to residents: rejected because the current reporting scope is fly-tipping
  only.

## Decision: Treat target completion state as the only open/closed signal

**Rationale**: A nearby report qualifies only when `Completed` is explicitly `false`. A
`Completed=true` report is excluded. No status-label filter is applied: the completion flag is the
single authoritative state used by this feature, which avoids excluding an otherwise relevant report
because its display label is blank or differs from an expected wording.

**Alternatives considered**:

- Filter by status labels in addition to completion: rejected by the explicit decision to remove
  status-label filtering.
- Treat missing completion as open: rejected because an unknown completion state cannot establish
  that a report remains active.

## Decision: Filter before safe-summary mapping and API serialization

**Rationale**: Filtering at the backend boundary ensures closed and unrelated reports never enter the
API response, frontend state, or resident-visible DOM. It also prevents filtered report descriptions,
addresses, images, history, and coordinates from being exposed beyond the request-local adapter.

**Alternatives considered**:

- Filter in the browser: rejected because irrelevant raw reports would be sent to the frontend.
- Filter after safe summaries are built: rejected because it retains unnecessary data longer than
  needed and makes data-minimization checks harder.
