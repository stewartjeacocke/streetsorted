# Feature Specification: Filter Nearby Reports

**Feature Branch**: `003-filter-nearby-reports`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "only list flytipping reports in nearby reports. dont show closed reports"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review relevant open fly-tipping reports (Priority: P1)

A resident who has supplied their location sees only nearby reports that concern fly-tipping and are
not closed, so they can decide whether an active report already matches the issue they intend to
report.

**Why this priority**: The duplicate check is useful only when it presents active reports relevant to
fly-tipping; unrelated or closed reports distract residents and can prevent appropriate new reports.

**Independent Test**: Given a nearby-report result containing active fly-tipping, closed fly-tipping,
and active non-fly-tipping reports, the resident sees only the active fly-tipping reports before the
match decision.

**Acceptance Scenarios**:

1. **Given** nearby reports include active fly-tipping reports, closed fly-tipping reports, and
   reports for other issue types, **When** the nearby-report check completes, **Then** the resident
   sees every active fly-tipping report and none of the closed or non-fly-tipping reports.
2. **Given** active nearby fly-tipping reports are displayed, **When** the resident confirms that one
   matches their issue, **Then** the existing reporting process stops without submitting a new report.
3. **Given** active nearby fly-tipping reports are displayed, **When** the resident confirms that none
   match, **Then** they can continue to the existing new fly-tipping report flow.

---

### User Story 2 - Continue when filtering removes all reports (Priority: P2)

A resident can continue to make a new report when nearby reports exist but all of them are closed or
are unrelated to fly-tipping.

**Why this priority**: A resident must not be blocked by nearby reports that cannot represent an
active duplicate of the issue being reported.

**Independent Test**: Given nearby results containing only closed or non-fly-tipping reports, the
resident sees the no-relevant-reports outcome and can continue without a match question.

**Acceptance Scenarios**:

1. **Given** nearby reports are returned but none are active fly-tipping reports, **When** filtering
   completes, **Then** the resident sees a clear no-relevant-reports message and can continue to new
   report details without answering a match question.

---

### User Story 3 - Handle incomplete report classifications safely (Priority: P3)

A resident is not shown a nearby report whose category or status cannot establish that it is an active
fly-tipping report, while the overall duplicate-check flow remains available.

**Why this priority**: Ambiguous reports must not be presented as relevant duplicates or prevent a
resident from reporting a genuine issue.

**Independent Test**: Given nearby reports with missing or unknown category/status information, the
resident does not see those entries and can continue according to the remaining relevant results.

**Acceptance Scenarios**:

1. **Given** a nearby report lacks a recognizable fly-tipping category or a recognizable open status,
   **When** filtering completes, **Then** that report is omitted from the displayed list.

### Edge Cases

- All nearby reports are closed: the feature treats the result as no relevant nearby reports and lets
  the resident continue.
- All nearby reports concern other issue types: the feature treats the result as no relevant nearby
  reports and lets the resident continue.
- A report changes from open to closed after the list is shown: the resident's decision applies to the
  displayed current-session result; the feature does not claim the report remains open afterward.
- An external report has a category/status value that is missing, blank, or unrecognized: it is not
  displayed as a relevant nearby report.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST display only nearby reports whose category identifies them as
  fly-tipping reports.
- **FR-002**: The feature MUST NOT display nearby reports whose status identifies them as closed.
- **FR-003**: The feature MUST omit a nearby report when its category or status cannot establish that
  it is an active fly-tipping report.
- **FR-004**: The feature MUST preserve every nearby report that meets both the fly-tipping and
  non-closed criteria; it MUST NOT silently cap or paginate the relevant result set.
- **FR-005**: When one or more relevant nearby reports remain after filtering, the feature MUST keep
  the existing resident-controlled match/no-match decision before new-report submission is enabled.
- **FR-006**: When no relevant nearby reports remain after filtering, the feature MUST state that no
  relevant nearby reports were found and allow the resident to continue without a match question.
- **FR-007**: The feature MUST continue to keep filtered-out report data transient, unlogged, and
  undisclosed to the resident.

### Key Entities *(include if feature involves data)*

- **Relevant nearby report**: A nearby report whose category identifies fly-tipping and whose status
  does not identify a closed report; it is eligible for display and duplicate matching.
- **Filtered nearby-report result**: The complete set of relevant nearby reports after excluding
  closed, non-fly-tipping, and unclassifiable entries.
- **No-relevant-reports outcome**: The result shown when the external service returns no nearby
  reports or filtering removes every returned report.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested mixed nearby-report results, residents see all and only active
  fly-tipping reports before the duplicate-match decision.
- **SC-002**: In 100% of tested results containing only closed, non-fly-tipping, or unclassifiable
  reports, residents see the no-relevant-reports outcome and can continue without a match question.
- **SC-003**: In 100% of tested relevant-report results, the existing match/no-match decision remains
  unavailable until the complete relevant list is shown.
- **SC-004**: In 100% of tested filtering flows, closed, non-fly-tipping, and unclassifiable report
  details do not appear in the resident-visible list or application logs.

## Assumptions

- The existing nearby-report duplicate-check feature provides the external report category and status
  values needed for filtering.
- A fly-tipping category is any category value that the configured service identifies as fly-tipping;
  all other category values are out of scope for the duplicate list.
- A closed status is any status value that the configured service identifies as closed; reports with
  missing or unknown status are excluded rather than assumed to be open.
- This feature filters the nearby-report display only. It does not alter the external service's report
  records, reopen closed reports, or create a new report automatically.
