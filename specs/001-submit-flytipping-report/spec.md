# Feature Specification: Submit Fly-tipping Report

**Feature Branch**: `001-submit-flytipping-report`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "submit a flytipping report using https://islington.lovecleanstreets.com/reports/add"

## Clarifications

### Session 2026-10-03

- Q: Should residents be able to submit a fly-tipping report without creating or signing in to an account? → A: Allow anonymous reporting
- Q: After a resident submits or abandons an anonymous report, how long should their report details be retained? → A: Retain only during the current session; discard on cancellation or session end
- Q: Should residents be able to attach photos as optional evidence for a fly-tipping report? → A: Do not accept photo attachments
- Q: How should a resident set the fly-tipping location? → A: Use browser-provided location
- Q: Should a resident be able to correct the detected location before submitting the report? → A: Use the detected location without allowing changes
- Q: What should happen if a resident denies location permission or their browser cannot determine a location? → A: Explain requirement and retry detection
- Q: Should the feature select “fly-tipping” as the report category automatically? → A: Select fly-tipping automatically
- Q: Must the reporting flow be usable with a keyboard and screen reader? → A: No explicit accessibility requirement

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a fly-tipping report (Priority: P1)

A resident who has seen fly-tipped waste in Islington can provide the location, a clear description, and the
required report details, review them, and submit the report through Islington's Love Clean Streets
service.

**Why this priority**: Submitting a complete report is the core outcome; without it, the feature
provides no civic-service value.

**Independent Test**: A resident can enter a valid location and description, continue without
creating or signing in to an account, explicitly confirm submission, and receive the service's
report-confirmation outcome.

**Acceptance Scenarios**:

1. **Given** a resident chooses to report anonymously and has the required report details, **When**
   they complete the report with fly-tipping selected automatically and explicitly confirm submission,
   **Then** the report is sent to the Love Clean Streets service and the resident sees the
   confirmation or reference supplied by that service without being required to create or sign in to
   an account.
2. **Given** the resident grants location permission, **When** the report begins, **Then** the
   feature obtains the resident's current location for the incident location and does not offer an
   option to change it.
3. **Given** the resident denies location permission or location detection fails, **When** they try
   to continue, **Then** the feature explains that location access is required and offers another
   location-detection attempt without submitting a report.
4. **Given** a required detail is missing or invalid, **When** the resident tries to proceed,
   **Then** they are told which detail needs correction and no report is submitted.

### Edge Cases

- The target service is unavailable, times out, or returns an unclear submission result: the resident
  MUST be told that submission was not confirmed and MUST be able to retry without assuming a report
  was filed.
- The location falls outside the service's supported area: the resident MUST be told that the report
  cannot be submitted through this service and MUST NOT receive a false confirmation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST allow a resident to start a fly-tipping report intended for submission
  through Islington's Love Clean Streets service.
- **FR-002**: The feature MUST automatically select fly-tipping as the report category and MUST NOT
  expose unrelated issue categories.
- **FR-003**: The feature MUST collect and present the information required to identify the incident,
  including its location and a resident-provided description.
- **FR-004**: The feature MUST request the resident's permission to obtain their current browser
  location and use the granted location as the incident location without offering a location-editing
  option.
- **FR-005**: The feature MUST explain that location access is required when permission is denied
  or location detection fails, and MUST offer the resident another detection attempt without
  submitting a report.
- **FR-006**: The feature MUST allow a resident to submit a report anonymously without requiring
  account registration or sign-in, and MUST clearly state that anonymous reporting may prevent
  delivery of report updates.
- **FR-007**: The feature MUST retain report details only for the active session and MUST discard
  them when the resident cancels or the session ends, unless they have been sent to the target
  service.
- **FR-008**: The feature MUST show the complete report content for resident review before final
  submission.
- **FR-009**: The feature MUST require an explicit resident confirmation immediately before it sends
  report information to the target service.
- **FR-010**: The feature MUST display the external service's confirmation, report reference, or a
  clearly stated unconfirmed outcome after a submission attempt.
- **FR-011**: The feature MUST permit a resident to cancel before final confirmation and MUST NOT
  submit a report after cancellation.

### Key Entities *(include if feature involves data)*

- **Street report**: A resident's proposed fly-tipping report, including the fixed fly-tipping
  category, location, description, and submission status.
- **Incident location**: The resident's browser-provided current location, used as the place of the
  reported fly-tipping incident.
- **Submission outcome**: The reported result of a submission attempt, including a confirmation or
  reference where supplied, or an explicitly unconfirmed state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of residents who begin with valid required information complete a confirmed
  fly-tipping report on their first attempt without assistance.
- **SC-002**: A resident with the required details can reach the final review and confirmation step in
  three minutes or less.
- **SC-005**: In usability testing, at least 90% of participants can correctly identify the report
  location, description, and final confirmation action before submitting.

## Assumptions

- Report details are retained only during the active anonymous reporting session unless and until
  the resident sends them to the external service.
- The feature does not accept or transmit photo attachments; residents provide the incident location
  and description only.
- If browser location access is unavailable, the resident is told it is required and may retry
  location detection; submission remains unavailable until a location is obtained.
- Residents grant browser permission before the feature obtains their current location, which is
  used without manual adjustment as the incident location.
- The feature has no explicit keyboard or screen-reader accessibility requirement beyond the default
  behavior of the resident's browser and the external service.
