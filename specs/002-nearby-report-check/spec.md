# Feature Specification: Check Nearby Reports

**Feature Branch**: `002-nearby-report-check`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "before submitting report list all reports nearby and ask user if any of them match what they want to report. If they do stop the reporting process."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Avoid a duplicate fly-tipping report (Priority: P1)

A resident who has supplied their incident location sees all nearby reports returned for that location
before they can submit a new fly-tipping report. The resident can review the available report details
and answer whether any report matches the issue they intended to report.

**Why this priority**: Avoiding duplicate reports is the feature's core value and must occur before
any new report reaches the council service.

**Independent Test**: With nearby reports available, a resident can view the complete returned list,
answer that a report matches, and verify that no new-report submission is attempted.

**Acceptance Scenarios**:

1. **Given** a resident has granted location access, **When** nearby reports are available for that
   location, **Then** the resident sees every returned nearby report before being allowed to continue
   to new-report submission.
2. **Given** nearby reports are displayed, **When** the resident confirms that one matches their
   intended issue, **Then** the reporting process stops and no new report is sent to the council
   service.
3. **Given** nearby reports are displayed, **When** the resident confirms that none match their
   intended issue, **Then** the resident can continue with the new fly-tipping report flow.

---

### User Story 2 - Continue when no nearby reports exist (Priority: P2)

A resident whose location has no nearby reports can clearly see that no matching reports were found
and continue to create a new report without having to answer a duplicate-report question.

**Why this priority**: Legitimate new reports must not be blocked when the service returns no nearby
reports.

**Independent Test**: With an empty nearby-report result, a resident sees the no-results message and
can proceed to the report details step.

**Acceptance Scenarios**:

1. **Given** a resident has granted location access, **When** no nearby reports are returned,
   **Then** the resident sees a clear no-results message and can continue to report the issue.

---

### User Story 3 - Handle unavailable nearby-report results safely (Priority: P3)

A resident is told when nearby reports cannot be retrieved and can retry the lookup; they cannot
submit a new report until the nearby-report check has completed successfully.

**Why this priority**: A failed duplicate check must not silently bypass the feature's purpose.

**Independent Test**: With a failed nearby-report lookup, a resident sees a retry action and cannot
reach new-report submission until a lookup returns either reports or an empty result.

**Acceptance Scenarios**:

1. **Given** the nearby-report lookup fails or times out, **When** the resident tries to continue,
   **Then** the resident sees a clear failure message and a retry action, and new-report submission
   remains unavailable.

### Edge Cases

- The nearby-report result changes while the resident is reviewing it: the answer applies to the list
  shown in that session; the feature does not claim the list remains current after the resident
  continues.
- A nearby report lacks optional descriptive information: the feature shows the available identifying
  details and still asks the resident to decide whether it matches.
- Many nearby reports are returned: the feature shows the complete returned list without silently
  omitting items and keeps the continue/stop decision available after the list.
- The resident leaves or cancels during the nearby-report check: no new report is submitted and the
  transient nearby-report data is discarded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST retrieve nearby reports for the resident's detected incident location
  before enabling new-report submission.
- **FR-002**: The feature MUST display every nearby report returned by the configured service and
  identify each report using all available non-sensitive summary details.
- **FR-003**: The feature MUST ask the resident whether any displayed nearby report matches the issue
  they intended to report whenever one or more nearby reports are returned.
- **FR-004**: If the resident confirms that a nearby report matches, the feature MUST stop the
  reporting process, discard the new-report draft, and MUST NOT send a new-report submission request.
- **FR-005**: If the resident confirms that no nearby report matches, the feature MUST allow them to
  continue to the existing new fly-tipping report flow.
- **FR-006**: If no nearby reports are returned, the feature MUST state that no nearby reports were
  found and allow the resident to continue without a duplicate-match question.
- **FR-007**: If nearby reports cannot be retrieved, the feature MUST show a retry action and MUST
  prevent new-report submission until a lookup completes successfully.
- **FR-008**: The feature MUST retain nearby-report information only during the active reporting
  session and MUST NOT log or persist the report list, location, or resident's match decision.

### Key Entities *(include if feature involves data)*

- **Nearby report**: A report returned for the resident's detected location, with the available
  identifying summary details used to help the resident decide whether it matches.
- **Nearby-report result**: The transient complete set of nearby reports and its lookup state:
  reports found, no reports found, or unavailable.
- **Duplicate-check decision**: The resident's transient answer that a nearby report matches or that
  none match; a matching decision terminates the new-report flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested submission attempts with nearby reports returned, residents see the
  complete nearby-report list and the match question before new-report submission is enabled.
- **SC-002**: In 100% of tested matching-decision flows, no new-report submission request is made
  after the resident says a nearby report matches.
- **SC-003**: In 100% of tested no-results flows, residents can reach the new-report details step
  without answering a match question.
- **SC-004**: In 100% of tested lookup failures, residents cannot submit a new report until retry
  produces a reports-found or no-results outcome.
- **SC-005**: At least 90% of usability-test participants can identify the nearby-report list and
  correctly choose whether to stop or continue the reporting process on their first attempt.

## Assumptions

- The existing anonymous fly-tipping reporting flow and browser-provided location remain in place.
- The configured external reporting service determines which reports count as nearby; this feature
  presents the entire set it returns and does not apply an additional distance filter.
- A resident, not the feature, decides whether an available nearby report matches their intended
  issue.
- Nearby-report data is treated as transient potentially sensitive information and is never retained
  after cancellation, session end, or a matching decision.
- This feature prevents creating a duplicate new report; it does not subscribe the resident to,
  modify, or track an existing nearby report.
