# Research: Check Nearby Reports

## Decision: Use the nearby-report endpoint referenced by the supplied report page

**Rationale**: The Love Clean Streets report page invokes a nearby-report lookup at
`/v2.svc/reports/nearby/{latitude},{longitude}` with `approvedonly` and `days` query values. The
current report page configures `approvedonly=false` and a 30-day window. Using the same endpoint and
values aligns the duplicate check with the target reporting journey.

**Alternatives considered**:

- Search public report pages or scrape the live map: rejected because the report page already
  identifies the nearby-report data source and its current query parameters.
- Use an arbitrary distance or time window: rejected because it would produce a different definition
  of nearby from the target reporting journey.

## Decision: Retrieve nearby reports through the existing backend

**Rationale**: Although the external endpoint permits browser requests, the backend can validate the
location, limit lookup frequency, remove non-summary fields, redact logs, and provide one stable
contract to the Jekyll site. This preserves the project's single backend-service boundary.

**Alternatives considered**:

- Browser-to-target lookup: rejected because it exposes an external payload directly to the client
  and bypasses the existing privacy, validation, and failure-normalization boundary.
- Persistent cache/history: rejected because the specification requires current-session-only data.

## Decision: Display every returned report as a safe summary

**Rationale**: The external result can include identifiers, category/status, recorded dates, address,
location, descriptions, images, history, and other metadata. The feature keeps all returned reports
but maps each one to a safe summary: report identifier, category, recorded date, address or location
label, status, and description only when the target marks the report approved. Images, history,
coordinates, duplicate metadata, and unapproved descriptions are excluded.

**Alternatives considered**:

- Return the full target payload: rejected because it carries unnecessary personal or operational
  metadata and violates data minimization.
- Cap or paginate the result: rejected because the specification requires the complete returned list.

## Decision: A matching decision terminates the draft locally

**Rationale**: The resident, not an automatic similarity algorithm, decides whether a nearby report
matches. On a positive answer, the frontend discards its draft and makes no request to the report
submission endpoint. No existing report is changed or followed.

**Alternatives considered**:

- Automatically determine duplicate status: rejected because the resident is best placed to judge
  whether nearby reports describe the same issue.
- Subscribe to an existing report: rejected as out of scope.

## Decision: Fail closed while nearby-report lookup is unavailable

**Rationale**: Submission remains disabled when a nearby lookup fails, times out, or returns an
invalid response. The resident sees a retry action. This prevents bypassing the duplicate check.

**Alternatives considered**:

- Allow new-report submission after lookup failure: rejected because it defeats the feature's stated
  duplicate-prevention purpose.
