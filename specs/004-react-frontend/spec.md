# Feature Specification: Migrate React Frontend

**Feature Branch**: `004-react-frontend`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "rewrite frontend using node.js and React. Move project to Node 26"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete the reporting flow in the new frontend (Priority: P1)

A resident can complete the existing anonymous fly-tipping reporting journey through the replacement
frontend: location, nearby-report check, report details, review, explicit confirmation, and a clear
outcome.

**Why this priority**: The frontend rewrite has value only if it preserves the complete resident
journey without degrading report creation or duplicate prevention.

**Independent Test**: A resident using the new frontend can complete a no-match report through the
mock target and receive the target confirmation reference without using the previous static frontend.

**Acceptance Scenarios**:

1. **Given** a resident opens the replacement frontend, **When** they grant location permission and
   no nearby report matches, **Then** they can complete the existing new-report journey and see its
   confirmation outcome.
2. **Given** a resident denies or cannot provide location, **When** they try to continue, **Then**
   they see the existing retry behavior and cannot submit a report.
3. **Given** a resident cancels at any point before confirmation, **When** they return to the start,
   **Then** their transient report and nearby-report information is discarded.

---

### User Story 2 - Prevent duplicate reports in the new frontend (Priority: P2)

A resident sees the existing filtered nearby fly-tipping reports in the replacement frontend and can
stop the reporting process when one matches their intended issue.

**Why this priority**: Duplicate prevention is a required safeguard in the existing resident journey
and must survive the migration.

**Independent Test**: With relevant nearby reports returned, a resident can select a matching report
and verify that no new-report submission request is made.

**Acceptance Scenarios**:

1. **Given** relevant nearby reports are returned, **When** the resident says one matches, **Then**
   the replacement frontend stops the process and does not send a new-report submission request.
2. **Given** the nearby lookup returns no relevant reports, **When** the resident continues, **Then**
   they reach report details without a duplicate-match question.
3. **Given** the nearby lookup is unavailable, **When** the resident retries, **Then** report details
   remain unavailable until the lookup succeeds or returns no relevant reports.

---

### User Story 3 - Build and operate the migrated project (Priority: P3)

A maintainer can install dependencies, run the frontend and backend locally, build production assets,
and run the validation suite using Node.js 26 without relying on the previous frontend runtime.

**Why this priority**: A frontend rewrite is incomplete if contributors cannot reliably develop,
validate, and deploy it with the required runtime.

**Independent Test**: A maintainer follows the documented Node.js 26 workflow to build the frontend,
start the backend, and run unit, contract, and browser tests successfully.

**Acceptance Scenarios**:

1. **Given** a maintainer uses Node.js 26, **When** they follow the documented setup, **Then** they
   can install, build, test, and run both project parts without the previous frontend toolchain.

### Edge Cases

- A frontend request returns a malformed or unavailable backend response: the resident sees the same
  safe unavailable/unconfirmed behavior as before and does not see backend internals.
- A resident refreshes the page during an in-progress report: transient draft state is discarded and
  no report is submitted automatically.
- The backend receives a request from an unapproved frontend origin: it remains rejected.
- A migration build finds obsolete static-frontend files: they are removed from the supported
  frontend delivery path and do not become a second resident-facing application.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST replace the supported resident-facing static frontend with a React
  frontend managed by Node.js.
- **FR-002**: The project MUST use Node.js 26 for the frontend, backend, development commands,
  automated tests, and production container/runtime configuration.
- **FR-003**: The replacement frontend MUST preserve the existing anonymous report journey, including
  mandatory location, nearby-report lookup, relevant-report filtering, duplicate-match stop,
  report details, review, explicit confirmation, cancellation, and outcomes.
- **FR-004**: The replacement frontend MUST continue to use the existing backend contracts for nearby
  lookup and report submission; it MUST NOT call the external council service directly.
- **FR-005**: The replacement frontend MUST keep report drafts, nearby results, and resident decisions
  transient and MUST discard them on cancellation, reset, or page refresh.
- **FR-006**: The replacement frontend MUST preserve the existing resident-visible safety behaviors:
  unavailable retry, stale-location refresh, no-results continuation, and out-of-area handling.
- **FR-007**: The project MUST remove the previous frontend runtime from the supported development and
  deployment workflow, including its obsolete build configuration and dependency instructions.
- **FR-008**: The migrated project MUST retain origin restrictions, sensitive-data redaction, request
  limits, and rate limiting at the backend boundary.

### Key Entities *(include if feature involves data)*

- **Report-flow state**: The resident's transient position in the location, nearby lookup, details,
  review, submission, stopped, or outcome journey.
- **Frontend API client**: The frontend boundary that communicates only with the existing project
  backend and normalizes resident-safe results.
- **Runtime configuration**: The documented Node.js 26 requirements and allowed frontend origin used
  to build, run, and validate the migrated project.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing automated report-flow and nearby-report scenarios pass through the
  replacement frontend without using the previous frontend runtime.
- **SC-002**: In 100% of tested duplicate-match decisions, the replacement frontend makes no
  new-report submission request.
- **SC-003**: In 100% of tested cancellation and page-refresh cases, no prior report draft or nearby
  result is restored automatically.
- **SC-004**: A maintainer can install, build, test, and start the migrated project using Node.js 26
  by following the documented workflow.
- **SC-005**: The replacement frontend shows a usable report-details or nearby-report result within
  10 seconds under the existing mock-target test conditions.

## Assumptions

- The existing backend endpoints and resident-visible behavior remain the source of functional truth
  during the migration.
- React and Node.js 26 are explicit user-provided technology constraints for this migration.
- The Jekyll frontend and Ruby-based workflow are retired rather than maintained as an alternate
  resident-facing application.
- The backend remains a single Node.js service and no persistent store, queue, account system, or
  additional external integration is introduced.
