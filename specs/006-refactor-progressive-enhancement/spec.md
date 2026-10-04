# Feature Specification: Refactor Client for Progressive Enhancement

**Feature Branch**: `006-refactor-progressive-enhancement`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "refactor client to enforce progressive enhancement"

## Clarifications

### Session 2026-10-04

- Q: Where should an in-progress report be kept while a resident moves between the server-rendered pages? → A: Keep the active report draft in a short-lived server-side session tied to the resident’s browser.
- Q: How long may an abandoned in-progress report remain available in the resident’s server-side session? → A: Expire after 5 minutes of inactivity; remove immediately after cancellation or final submission.
- Q: After the server-rendered form journey is complete, should any JavaScript enhancement remain in the reporting experience? → A: Remove all reporting-page JavaScript and deliver only server-rendered pages and forms. The only exception to this is to leave JavaScript enhancement to get the users location.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a report without JavaScript (Priority: P1)

A resident can complete the fly-tipping report journey with JavaScript unavailable, including
providing a location, checking nearby reports, entering a description, reviewing the information,
and submitting a confirmed report.

**Why this priority**: The reporting journey is the service's primary user value and must remain
available when scripts do not run.

**Independent Test**: With JavaScript disabled, a resident can use only ordinary page navigation and
forms to submit a valid report and receive its submission outcome.

**Acceptance Scenarios**:

1. **Given** JavaScript is unavailable, **When** a resident opens the reporting service, **Then** the
   page provides the content and controls needed to start a report.
2. **Given** a resident provides a valid location, **When** they request a nearby-report check,
   **Then** the nearby results or an understandable availability message appear on the next page.
3. **Given** no nearby report matches and the resident supplies a valid description, **When** they
   confirm the review page, **Then** the service shows the resulting reference or an understandable
   outcome message.

---

### User Story 2 - Complete the duplicate-report decision without JavaScript (Priority: P2)

A resident can inspect nearby reports, decide that an existing report matches, and finish without
creating a duplicate report when JavaScript is unavailable.

**Why this priority**: Avoiding duplicate submissions protects the quality of reported issues while
preserving a complete alternative to the primary submission path.

**Independent Test**: With JavaScript disabled and nearby reports available, a resident can view the
reports, select that a match exists, and receive confirmation that no new report was submitted.

**Acceptance Scenarios**:

1. **Given** nearby reports are found, **When** a resident indicates that one matches their issue,
   **Then** the service confirms that no new report was submitted.
2. **Given** nearby reports are unavailable, **When** a resident retries or continues as permitted,
   **Then** the service presents a clear next action without losing valid entered information.

---

### User Story 3 - Navigate resilient reporting pages (Priority: P3)

A resident can use normal browser navigation, including Back, refresh, and direct page requests,
without relying on a reporting-page script or losing clarity about the next available action.

**Why this priority**: Page navigation is the foundation of the required non-SPA journey and must
remain dependable when residents correct data or recover from an interruption.

**Independent Test**: A resident can use Back, refresh a reporting page, or request an intermediate
page directly and receives either the expected page or an understandable recovery path.

**Acceptance Scenarios**:

1. **Given** a resident navigates Back or refreshes during a valid active draft, **When** the page
   reloads, **Then** the service shows the applicable reporting step without requiring JavaScript.
2. **Given** a resident requests a step without the required active draft information, **When** the
   service handles the request, **Then** it explains how to return to an available reporting step.

---

### Edge Cases

- Browser location detection is unavailable, denied, or inaccurate: the resident can provide a valid
  location through the non-JavaScript journey and is told when it is invalid.
- A resident refreshes, follows Back, or opens an intermediate page directly: the service gives an
  understandable recovery path and does not submit a report without explicit confirmation.
- The nearby-report service or report submission is temporarily unavailable: the resident sees a
  clear status, retry option where applicable, and does not receive a false submission confirmation.
- Validation fails for location or description: the relevant page identifies the invalid input and
  retains safe, previously entered values needed for correction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The reporting service MUST provide each user-facing reporting step as meaningful,
  server-rendered HTML containing the content and controls required for that step.
- **FR-002**: Residents MUST be able to complete the full report journey using ordinary browser page
  navigation and standard forms when JavaScript is unavailable.
- **FR-003**: The non-JavaScript journey MUST support valid location entry, nearby-report lookup,
  duplicate-match selection, description entry, review, explicit confirmation, submission outcome,
  cancellation, and retry where an existing outcome permits retrying.
- **FR-004**: The service MUST preserve the existing requirement that a report is submitted only
  after the resident explicitly confirms the review information.
- **FR-005**: The service MUST show field-specific, understandable validation feedback and retain
  safe entered values when a resident must correct an input.
- **FR-006**: The service MUST present nearby-report results and unavailable-result messages to
  residents without requiring client-side code to load or render them.
- **FR-007**: The reporting journey MUST deliver only server-rendered pages and standard forms;
  it MUST NOT require or deliver reporting-page JavaScript for resident actions.
- **FR-008**: User-facing navigation MUST use ordinary document navigation; the client MUST NOT
  introduce single-page application behavior or client-side routing.
- **FR-009**: The refactor MUST preserve current confidentiality protections: report location and
  description remain limited to the active reporting journey and are not newly stored in browser
  storage or client-visible logs.
- **FR-010**: The service MUST provide an understandable recovery path when a resident opens a
  reporting step without the information required for that step.
- **FR-011**: The service MUST keep an in-progress report draft in a server-side session tied to
  the resident’s browser, rather than in browser storage or URLs.
- **FR-012**: The service MUST expire an inactive report draft after five minutes and remove it
  immediately when the resident cancels or receives a final submission outcome.

### Key Entities *(include if feature involves data)*

- **Report draft**: A resident's in-progress location and description, held in a server-side
  session for the active browser that expires after five minutes of inactivity and is removed on
  cancellation or final submission; it does not create a submitted report until explicit confirmation.
- **Nearby report result**: A potential existing report shown to help a resident avoid submitting a
  duplicate.
- **Submission outcome**: The resident-visible result of a confirmed submission, including any
  reference and whether retrying is permitted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of automated end-to-end tests for the primary reporting journey pass with
  JavaScript disabled, from opening the service through a confirmed submission outcome.
- **SC-002**: 100% of automated end-to-end tests for the duplicate-match journey pass with
  JavaScript disabled without creating a new report.
- **SC-003**: 100% of tested validation, unavailable-service, cancellation, and retry paths present
  an understandable message and a usable next action with JavaScript disabled.
- **SC-004**: 100% of automated end-to-end tests confirm that reporting-page responses provide
  their required content and controls without loading a reporting-page script.
- **SC-005**: A resident who has valid location and report details can complete the standard report
  journey in five minutes or less under normal service availability.

## Assumptions

- The existing single Node.js application remains the sole deployable; this work does not introduce
  a separate frontend service or client-side router.
- Residents can manually supply latitude and longitude when browser location detection is unavailable
  or JavaScript is disabled.
- The active report draft is held in a server-side session tied to the resident’s browser, expires
  after five minutes of inactivity, and is removed on cancellation or final submission.
- Existing report validation, rate limiting, submission integrations, and resident-facing outcome
  wording remain the behavioral baseline unless changes are required to make the journey usable
  without JavaScript.
- The refactor removes reporting-page JavaScript rather than retaining optional enhancements;
  redesigning the report's business process is out of scope.
