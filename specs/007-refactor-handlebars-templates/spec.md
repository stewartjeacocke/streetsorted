# Feature Specification: Refactor Report Views to Handlebars Templates

**Feature Branch**: `007-refactor-handlebars-templates`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "refactor client to use handlebars templates"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete a report using templated pages (Priority: P1)

As a resident, I can complete the existing fly-tipping report journey through consistently rendered
pages so that I can submit a report without a change in the information or actions available to me.

**Why this priority**: Reporting is the service's primary user journey; the refactor must not disrupt it.

**Independent Test**: Complete a valid report from location entry through confirmed submission and
verify the same page content, controls, and outcome are available at every step.

**Acceptance Scenarios**:

1. **Given** a resident starts a new report, **When** they enter a valid location, provide report
   details, review them, and confirm submission, **Then** each step displays its current content and
   controls and the resident receives the submission outcome.
2. **Given** a resident has reached a report step, **When** they use an available cancel, edit, or
   continue action, **Then** they reach the same next state and receive the same feedback as before the
   refactor.
3. **Given** JavaScript is unavailable, **When** a resident completes the reporting journey,
   **Then** standard forms and ordinary page navigation remain sufficient to complete it.

---

### User Story 2 - Understand exceptional report states (Priority: P2)

As a resident, I can understand and act on validation, recovery, duplicate-report, unavailable-service,
and retry states so that I can correct a problem or choose an appropriate next action.

**Why this priority**: Clear exceptional states prevent residents from losing progress or incorrectly
believing that a report was submitted.

**Independent Test**: Trigger each existing exceptional state and verify its message, retained safe
input values, and available next action are rendered correctly.

**Acceptance Scenarios**:

1. **Given** a resident submits invalid location or description data, **When** the page is shown
   again, **Then** it identifies the validation issue and retains the submitted safe values for correction.
2. **Given** nearby reports are found, unavailable, or absent, **When** the lookup result is shown,
   **Then** the resident sees the corresponding report information or message and the appropriate decision
   or retry action.
3. **Given** a resident opens or posts to a report step without a valid active report state,
   **When** the service responds, **Then** they see an understandable recovery page directing them to
   start a new report.

---

### User Story 3 - Maintain safe and consistent presentation (Priority: P3)

As a service maintainer, I can update shared and page-specific report markup through reusable templates
so that page presentation is consistent and dynamic resident or service values remain safe to display.

**Why this priority**: Reusable templates reduce duplicated page markup while preserving the safety and
consistency of the resident experience.

**Independent Test**: Render every page type with ordinary and markup-like dynamic values and verify
that shared page structure is present and dynamic text is displayed as text rather than executable or
structural markup.

**Acceptance Scenarios**:

1. **Given** any report page is rendered, **When** it is delivered to the resident, **Then** it uses
   the common Street Sorted document structure, styling, title treatment, and page heading.
2. **Given** a page includes dynamic text from a resident or an external service, **When** it is
   rendered, **Then** the text is safely displayed without changing the page's HTML structure.
3. **Given** the location-entry page is rendered, **When** the browser supports the existing optional
   location helper, **Then** the helper remains available without becoming required for report completion.

### Edge Cases

- A location, description, validation message, nearby-report field, submission message, or reference
  contains characters that resemble HTML; the resident sees literal text and the document remains valid.
- Nearby reports have partial optional data; each available value is shown without blank or malformed
  list content.
- A nearby lookup returns an unavailable result before a retry, or a submission result permits retry;
  the corresponding action remains available and posts the required confirmation data.
- A report session has expired, the request has an invalid anti-forgery value, or the resident opens a
  step out of order; the recovery response remains clear and does not expose report data.
- The optional location helper does not load or cannot obtain a location; residents can still enter
  coordinates manually.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The service MUST render the shared report document layout and every current report-flow
  page through Handlebars templates.
- **FR-002**: The templated report flow MUST preserve the currently available resident journeys:
  location entry, nearby-report lookup and decision, report details, review, confirmed submission,
  cancellation, retry, outcome, and recovery.
- **FR-003**: The templated pages MUST preserve the current visible wording, form fields, form targets,
  submitted control values, and validation feedback unless a change is required solely to express the
  same behavior in a template.
- **FR-004**: The service MUST continue to render the location, nearby-report, details, review,
  outcome, validation, and recovery states with their required data and actions.
- **FR-005**: Dynamic values presented to residents, including entered values, errors, nearby-report
  information, submission messages, and reference values, MUST be safely encoded for HTML display.
- **FR-006**: The templated report journey MUST work with JavaScript disabled using server-rendered
  HTML, standard forms, and ordinary document navigation.
- **FR-007**: The location page MAY retain its existing optional location helper, but manual coordinate
  entry MUST remain fully usable when the helper is unavailable or JavaScript is disabled.
- **FR-008**: The refactor MUST preserve the existing server-side report-session, anti-forgery,
  validation, HTTP status, redirect, cancellation, and retry behavior.
- **FR-009**: The refactor MUST NOT introduce client-side routing, a separate frontend deployable,
  browser storage of report data, or new client-visible logging of report location or description.
- **FR-010**: Shared document presentation MUST be defined once and used consistently by all report
  pages.

### Key Entities _(include if feature involves data)_

- **Report view model**: The page-specific information required to present a report-flow state,
  including safe field values, feedback, actions, and optional report data.
- **Shared page layout**: The common document structure and presentation used by all resident report
  pages.
- **Report draft**: The existing server-side, browser-associated in-progress location and description;
  this feature changes only its presentation, not its lifetime or storage.
- **Nearby report result**: The existing result state and optional report details presented while a
  resident decides whether to continue their report.
- **Submission outcome**: The existing resident-visible submission status, reference when available,
  and retry availability.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of automated end-to-end tests for the existing successful report, duplicate-match,
  validation/recovery, unavailable-nearby-report retry, and submission-retry journeys pass after the
  refactor.
- **SC-002**: 100% of automated end-to-end tests for the primary and duplicate-match report journeys
  pass with JavaScript disabled.
- **SC-003**: 100% of tested report-page responses contain the expected shared document presentation,
  page-specific content, and working standard-form controls for their state.
- **SC-004**: 100% of tests using markup-like dynamic input confirm that it is shown as text and does
  not create executable content or additional page structure.
- **SC-005**: A resident with valid location and report details can complete the standard report
  journey in five minutes or less under normal service availability.

## Assumptions

- The current Express application remains the single deployable and continues to serve all resident
  report pages.
- This work covers all current resident-facing report pages and the shared document layout; it does
  not redesign the report workflow or add new resident features.
- Existing visible wording, route paths, form behavior, session rules, anti-forgery checks, and status
  codes are the behavioral baseline for the refactor.
- Handlebars is used for server-side rendering only; no single-page application or client-side routing
  is introduced.
- The existing optional location helper remains a progressive enhancement and is not expanded in scope.
