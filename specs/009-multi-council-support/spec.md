# Feature Specification: Multi-Council Love Clean Streets Support

**Feature Branch**: `009-multi-council-support`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "extend all existing functionality to support all other councils that use lovecleanstreets.com"

## Clarifications

### Session 2026-10-04

- Q: How should the service determine which council receives a resident’s report? → A: The service automatically chooses a council from the reported location.
- Q: What should happen when a resident’s location does not map to any currently supported council? → A: Do not allow reporting; explain the location is unsupported and allow location correction or exit.
- Q: What should the service treat as the source of truth when deciding whether a location belongs to a supported council? → A: Use a third-party geographic lookup as the sole authority.
- Q: What resident data may be sent to the third-party geographic lookup to identify the council? → A: Send only latitude and longitude.
- Q: What should the resident experience when the third-party geographic lookup is temporarily unavailable? → A: Preserve the location; show a temporary-unavailable message with retry and exit options.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Report fly-tipping through the identified council (Priority: P1)

As a resident, I can provide an issue location and complete the existing fly-tipping reporting
journey so that the service identifies the responsible council and sends my report through that
council's Love Clean Streets service.

**Why this priority**: The present journey is limited to one council. Supporting each eligible
council is only valuable if the service can reliably direct a report to the appropriate authority.

**Independent Test**: For any supported council, start a new report from a location within that
council's area, confirm that the service identifies the council, supply a description, continue
through the nearby-report decision, and confirm that the target receives a fly-tipping report for
that council.

**Acceptance Scenarios**:

1. **Given** a resident provides a location that the geographic authority lookup assigns to a
   supported council, **When** they begin a report, **Then** the service identifies that council as
   the authority for the rest of that report journey.
2. **Given** the service has identified a supported council from a valid location, **When** the
   resident continues, **Then** the existing nearby-report check uses reports relevant to that
   council and location.
3. **Given** a resident completes the existing review and confirmation steps, **When** the
   identified council accepts the report, **Then** the resident sees a submission confirmation and
   any reference supplied by that council.
4. **Given** JavaScript is unavailable, **When** a resident provides a location and completes every
   report step, **Then** they can finish the same journey through standard browser forms and
   navigation.

---

### User Story 2 - Receive council-specific report outcomes (Priority: P2)

As a resident, I receive clear, council-appropriate results when a report is accepted, rejected as
outside the identified council's area, cannot be accepted, or cannot be confirmed so that I know
whether to retry, correct the location, or stop.

**Why this priority**: A generic or incorrect authority name can cause a resident to misunderstand
where their report went or to retry a report that may already have been submitted.

**Independent Test**: Exercise accepted, out-of-area, validation-failure, and indeterminate
responses for two or more supported councils, and verify that each resident-facing outcome is
accurate, does not name a different council, and offers only the permitted next action.

**Acceptance Scenarios**:

1. **Given** the identified council says that the location is outside its area, **When** the resident
   submits the report, **Then** the service states that the council cannot accept the report and
   lets the resident restart with a corrected location without representing the report as submitted.
2. **Given** the identified council returns a report reference, **When** the resident views the
   outcome, **Then** the service displays that reference with an unambiguous submission confirmation.
3. **Given** the service cannot determine whether the identified council received a report, **When**
   the resident views the outcome, **Then** it does not claim submission and offers the existing
   safe retry path.

---

### User Story 3 - Understand the council identified for the location (Priority: P3)

As a resident, I can see the council identified for my issue location throughout a report so that I
can understand which authority will receive it and correct the location before creating a report.

**Why this priority**: Supporting several councils introduces an automatic routing decision that must
be clear without requiring residents to understand underlying service differences.

**Independent Test**: Open the report start page, provide a location within a supported area, and
move forward and backward through the journey; verify that the identified council remains visible
and that changing the location causes the council to be identified again before submission.

**Acceptance Scenarios**:

1. **Given** a resident begins a new report and provides a location, **When** the geographic
   authority lookup assigns the location to a supported council, **Then** the service identifies that
   council with an understandable name.
2. **Given** the service has identified a council, **When** the resident reviews or edits the report
   before submission, **Then** the identified council remains visible and the resident can return to
   correct the location before confirming the report.
3. **Given** a council is no longer available for new reports, **When** a resident supplies a
   location in its area, **Then** the service does not identify it as available and no report is sent
   to it.
4. **Given** a resident's location does not map to a currently supported council, **When** they try
   to continue, **Then** the service explains that the location cannot be routed, prevents report
   submission, and lets the resident correct the location or leave the journey.

### Edge Cases

- A resident submits coordinates outside the identified council's area; the result must not be
  described as a successful submission and must provide a safe route to correct the location.
- The geographic authority lookup does not return exactly one available supported council; the
  service must not query or submit a report and must clearly tell the resident that the location
  cannot currently be routed.
- The third-party geographic authority lookup is temporarily unavailable; the service must preserve
  the entered location, state that council identification is temporarily unavailable, and allow the
  resident to retry or leave without querying or submitting to a council.
- A selected council's report service or nearby-report information is temporarily unavailable; the
  service preserves the current report state, gives clear recovery guidance, and does not silently
  use another council.
- A council supports a differently named or identified fly-tipping category; the resident still sees
  the standard fly-tipping journey while the correct council-specific category is used.
- A council's response is malformed, changes unexpectedly, or lacks a reference; the service must
  treat the submission as unconfirmed rather than falsely report success.
- A resident corrects the location after entering description details; the service must identify the
  council again, and any nearby results tied to the prior location or council must not be reused.
- A resident opens a saved, expired, or tampered report step with a missing or unsupported council;
  the service must not submit a report and must direct the resident to restart safely.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST support the existing fly-tipping report journey for every council
  whose public Love Clean Streets service is compatible with the journey's anonymous location,
  nearby-report, and report-submission capabilities (a **supported council**).
- **FR-002**: The system MUST maintain a current supported-council directory containing, for each
  supported council, its resident-facing name and the council-specific information needed to match an
  authority-lookup result, find equivalent nearby fly-tipping reports, and submit a fly-tipping
  report.
- **FR-003**: The system MUST use a third-party geographic authority lookup as the sole source of
  truth to identify the responsible council from a resident's reported location, and MUST proceed
  only when that result maps to a currently supported council in the directory.
- **FR-004**: The system MUST require a reported location to identify exactly one supported council
  before the nearby-report, details, review, and submission portions of the report journey can proceed.
- **FR-005**: The system MUST retain the council identified from the location as part of the report
  journey, display it on subsequent resident-facing steps, and allow the resident to return and
  correct the location before report confirmation.
- **FR-006**: When a resident changes the reported location, the system MUST invalidate any
  nearby-report result obtained for the previous location or council and MUST use the newly identified
  council for all later external interactions in that journey.
- **FR-007**: The system MUST preserve the current location capture, duplicate-check, description,
  review, confirmation, cancellation, retry, and report-outcome behaviors for every supported
  council, except where a council-specific outcome requires different resident guidance.
- **FR-008**: For the council identified from the resident's supplied location, the system MUST query
  and display only its relevant active fly-tipping reports near that location before asking whether
  an existing report matches.
- **FR-009**: For the council identified from the resident's location, the system MUST submit a
  confirmed report using that council's corresponding fly-tipping category and required report
  information; it MUST NOT send a report to another council.
- **FR-010**: The system MUST display resident-facing confirmation, validation, out-of-area,
  unavailable, and unconfirmed-submission messages that accurately identify or apply to the council
  identified from the location and never incorrectly name Islington or another council.
- **FR-011**: When the council identified from a location reports that the location lies outside its
  area, the system MUST not present the report as submitted, MUST not offer an automatic duplicate
  submission, and MUST offer the resident a way to restart so that the geographic authority lookup
  can resolve the location again.
- **FR-012**: The system MUST treat an unexpected or ambiguous council response as unconfirmed unless
  a successful submission can be established from the response; it MUST preserve the existing safe
  retry behavior for unconfirmed outcomes.
- **FR-013**: The system MUST exclude a council from automatic location identification when its
  required council-specific reporting information is missing, invalid, or marked unavailable.
- **FR-014**: The system MUST ensure that a report journey with a missing, expired, altered, or no
  longer supported council assignment cannot query or submit through a council service.
- **FR-015**: When a resident's location maps to no currently supported council, the system MUST
  prevent nearby-report lookup and report submission, clearly state that the location cannot be
  routed, and allow the resident to correct the location or leave the report journey.
- **FR-016**: The multi-council journey MUST remain usable through ordinary forms, keyboard
  navigation, and standard browser navigation when JavaScript, optional browser location access, or
  optional styling is unavailable.
- **FR-017**: The system MUST not expose council-service credentials, private configuration, or
  resident report details to other councils, to browser-visible configuration, or to logs beyond the
  information needed for established operational handling.
- **FR-018**: The system MUST send only the resident's reported latitude and longitude to the
  third-party geographic authority lookup; it MUST NOT send the report description, report reference,
  session details, location accuracy, or other resident data to that lookup.
- **FR-019**: When the third-party geographic authority lookup is temporarily unavailable, the
  system MUST preserve the resident's entered location, clearly state that council identification
  is temporarily unavailable, prevent council lookup and report submission, and allow the resident
  to retry or leave the report journey.

### Key Entities

- **Supported council**: A council with a currently compatible public Love Clean Streets reporting
  service, a resident-facing name, and the council-specific reporting information needed by this
  journey.
- **Council reporting profile**: The maintained information that associates a supported council with
  its authority-lookup identifier, fly-tipping category, compatible nearby-report source, reporting
  destination, availability, and resident-facing out-of-area guidance.
- **Geographic authority lookup**: The third-party source of truth that assigns a reported location
  to a council authority.
- **Council assignment**: The supported council matched from the geographic authority lookup for one
  report journey; it governs all council-specific lookup and submission actions for that journey.
- **Council-scoped nearby-report result**: The filtered active fly-tipping reports returned for one
  location and one identified council; it cannot be reused after either value changes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of councils in the supported-council directory pass an end-to-end compatibility
  check demonstrating that a resident can provide an in-area location, have the council identified,
  complete the existing report journey, and receive a correctly classified test outcome.
- **SC-002**: In 100% of tested journeys across all supported councils, nearby-report results and
  report submissions are sent only to the council identified for that journey.
- **SC-003**: In 100% of tested out-of-area, rejected, ambiguous, and accepted responses across the
  supported-council directory, residents receive an outcome that does not falsely claim submission
  or name an incorrect council.
- **SC-004**: At least 95% of representative residents can provide a location, understand the council
  identified for it, and begin the existing reporting journey on their first attempt without assistance.
- **SC-005**: 100% of acceptance scenarios for council identification, location changes, nearby
  checks, submission, recovery, and outcome display pass with JavaScript disabled.
- **SC-006**: In keyboard-only and assistive-technology review, 100% of identified-council
  indicators, validation messages, and location-correction actions are reachable, labeled, and
  understandable without a blocking navigation issue.
- **SC-007**: In 100% of tested temporary geographic-lookup outages, the resident's entered
  location is retained, no council lookup or report submission occurs, and retry and exit actions
  remain available.

## Assumptions

- The feature extends only the existing fly-tipping reporting journey; it does not add resident
  accounts, report tracking, photo uploads, new issue categories, or non-Love Clean Streets councils.
- "All other councils" means every council with a currently compatible public Love Clean Streets
  service that can support the existing anonymous fly-tipping, nearby-report, and submission flow;
  councils that cannot meet those compatibility conditions remain unavailable until they do.
- The supported-council directory is maintained as council services change, and compatibility is
  verified before a council is made available to residents.
- A third-party geographic authority lookup is the sole authority for determining which council
  covers a reported location; if a council subsequently rejects that location as out of area, the
  journey safely stops and the location must be resolved again before another submission attempt.
- The existing privacy, session-expiry, rate-limiting, security, and progressive-enhancement rules
  continue to apply to every council-specific journey.
