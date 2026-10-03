---

description: "Task list for nearby report duplicate check"
---

# Tasks: Check Nearby Reports

**Input**: Design documents from `/specs/002-nearby-report-check/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/nearby-reports.md`, `quickstart.md`

**Tests**: Backend contract/integration and Playwright tests are included because the plan and
quickstart require mock-target validation. Automated tests MUST NOT query or submit reports to the
live council service.

**Organization**: Tasks are grouped by user story so duplicate prevention, empty results, and safe
lookup failure handling are independently testable increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel once its dependencies are complete.
- **[Story]**: User story served by the task.
- Every task includes an exact target path.

## Path Conventions

- Jekyll static frontend: `frontend/`
- Node.js 24 LTS backend: `backend/`
- Cross-tier browser tests: `tests/e2e/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add nearby-report configuration and mock fixtures to the existing split application.

- [X] T001 Add configured nearby-report base URL, 30-day window, and `approvedonly=false` defaults to `backend/src/config.ts` and `backend/.env.example`
- [X] T002 [P] Add nearby-report mock payload fixtures containing reports-found, no-results, unavailable, unapproved descriptions, images, history, and raw coordinates in `backend/tests/fixtures/love-clean-streets/nearby-reports/`
- [X] T003 [P] Extend the mock Love Clean Streets application with the configured nearby-report lookup endpoint and fixture switching in `backend/src/dev/mock-target-app.ts` and `backend/tests/support/mock-target.ts`
- [X] T004 [P] Add nearby-report test commands and scenario documentation references to `backend/package.json` and `specs/002-nearby-report-check/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish transient nearby-report models, safe mapping, and common lookup-state controls
before any resident journey can begin.

**⚠️ CRITICAL**: Complete this phase before user-story work.

- [X] T005 Create backend schemas for nearby lookup coordinates, `loading`/`reports-found`/`no-results`/`unavailable` states, and safe summaries in `backend/src/domain/nearby-report.ts`; preserve all returned summaries in target order and require `id`, `categoryName`, `recordedAt`, `locationLabel`, `statusName`, and approved-only `description` handling
- [X] T006 [P] Extend backend log redaction to exclude nearby-report lists, report identifiers, addresses, descriptions, coordinates, images, history, and match decisions in `backend/src/middleware/logger.ts` and `backend/tests/unit/logger.test.ts`
- [X] T007 [P] Add a transient frontend nearby-lookup state module with `loading`, `reports-found`, `no-results`, `unavailable`, `match`, and `no-match` transitions plus discard-on-cancel/session-end behavior in `frontend/assets/js/nearby-reports.js` and `frontend/assets/js/report-state.js`
- [X] T008 Add a rate-limited, configured-origin `GET /api/nearby-reports` route shell that validates latitude and longitude before external lookup in `backend/src/routes/nearby-reports.ts`, `backend/src/middleware/rate-limit.ts`, and `backend/src/app.ts`
- [X] T009 Add foundational tests for invalid nearby coordinates, unapproved-description removal, raw-field removal, and sensitive-log redaction in `backend/tests/contract/nearby-reports.test.ts` and `backend/tests/unit/logger.test.ts`

**Checkpoint**: Nearby lookup inputs, output shapes, privacy filtering, and the protected API boundary are
ready for user-story implementation.

---

## Phase 3: User Story 1 - Avoid a duplicate fly-tipping report (Priority: P1) 🎯 MVP

**Goal**: Show every safe nearby-report summary after location acquisition, ask whether any match, and
stop without submitting a new report when the resident says yes.

**Independent Test**: With the mock target returning multiple reports, a resident sees every safe
summary, selects a matching report, sees the stopped outcome, and no request reaches `POST /api/reports`.

### Tests for User Story 1

- [X] T010 [P] [US1] Add adapter integration coverage for the Love Clean Streets nearby endpoint path, `approvedonly=false`, `days=30`, complete result mapping, and target-order preservation in `backend/tests/integration/nearby-reports-adapter.test.ts`
- [X] T011 [P] [US1] Add `GET /api/nearby-reports` contract coverage for reports-found safe summaries and configured-origin access in `backend/tests/contract/nearby-reports.test.ts`
- [X] T012 [P] [US1] Add a browser-flow test proving every nearby summary is displayed, a matching answer stops the flow, discards the draft, and never calls the new-report submission endpoint in `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement the Love Clean Streets nearby-report client that requests `/v2.svc/reports/nearby/{latitude},{longitude}` with `approvedonly=false` and `days=30` in `backend/src/adapters/love-clean-streets/nearby-reports.ts`
- [X] T014 [US1] Implement safe target mapping that returns every report while excluding images, history, coordinates, duplicate metadata, and unapproved descriptions in `backend/src/adapters/love-clean-streets/nearby-reports.ts` and `backend/src/domain/nearby-report.ts`
- [X] T015 [US1] Implement the request-local nearby-report lookup service and normalized `reports-found` result in `backend/src/services/nearby-reports-service.ts`
- [X] T016 [US1] Implement the `GET /api/nearby-reports` contract and register it without changing `POST /api/reports` behavior in `backend/src/routes/nearby-reports.ts` and `backend/src/app.ts`
- [X] T017 [P] [US1] Add Jekyll markup for the nearby-report loading/list/duplicate-decision/stopped states, including one control to confirm a match and one to confirm no match, in `frontend/report.md` and `frontend/_layouts/default.html`
- [X] T018 [US1] Request nearby reports immediately after valid location acquisition, render every returned summary, and prevent report-details/review/submission controls until a duplicate decision in `frontend/assets/js/report-flow.js`, `frontend/assets/js/nearby-reports.js`, and `frontend/assets/js/report-api.js`
- [X] T019 [US1] Implement a positive-match action that discards location, description, nearby list, and decision state; shows a stopped outcome; and does not call `POST /api/reports` in `frontend/assets/js/report-flow.js` and `frontend/assets/js/report-state.js`

**Checkpoint**: A resident can independently prevent a duplicate report when a nearby match exists.

---

## Phase 4: User Story 2 - Continue when no nearby reports exist (Priority: P2)

**Goal**: Let a resident continue directly to existing report details when the lookup returns no
nearby reports.

**Independent Test**: With the mock target returning an empty list, the resident sees a no-results
message, receives no duplicate question, and can proceed to description/review.

### Tests for User Story 2

- [X] T020 [P] [US2] Add backend contract and integration tests for a normalized `no-results` response from an empty target list in `backend/tests/contract/nearby-reports.test.ts` and `backend/tests/integration/nearby-reports-adapter.test.ts`
- [X] T021 [P] [US2] Add a browser-flow test for no-results messaging and direct continuation to report details without a duplicate decision in `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 2

- [X] T022 [US2] Normalize an empty target result to `no-results` with an empty summaries list in `backend/src/services/nearby-reports-service.ts` and `backend/src/routes/nearby-reports.ts`
- [X] T023 [US2] Render the no-results message and unlock the existing report-details state without displaying duplicate-decision controls in `frontend/assets/js/report-flow.js`, `frontend/assets/js/nearby-reports.js`, and `frontend/report.md`

**Checkpoint**: A resident with no nearby reports can independently begin a new fly-tipping report.

---

## Phase 5: User Story 3 - Handle unavailable nearby-report results safely (Priority: P3)

**Goal**: Prevent reporting when lookup is unavailable and offer a retry until a safe lookup result
is obtained.

**Independent Test**: With the mock target failing or returning malformed data, a resident sees a
retry action and cannot reach new-report submission; retrying to a valid result unlocks the correct
next state.

### Tests for User Story 3

- [X] T024 [P] [US3] Add adapter and route tests for target timeout, non-success status, malformed payload, and `unavailable` normalization in `backend/tests/integration/nearby-reports-adapter.test.ts` and `backend/tests/contract/nearby-reports.test.ts`
- [X] T025 [P] [US3] Add browser-flow coverage for unavailable lookup, disabled report controls, retry, and later successful reports/no-results transitions in `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 3

- [X] T026 [US3] Normalize target lookup timeout, transport errors, and malformed external payloads to an `unavailable` response without exposing target payloads or stack traces in `backend/src/adapters/love-clean-streets/nearby-reports.ts` and `backend/src/services/nearby-reports-service.ts`
- [X] T027 [US3] Render an unavailable message and retry action, retain the duplicate gate, and block existing details/review/submission controls until retry succeeds in `frontend/assets/js/report-flow.js`, `frontend/assets/js/nearby-reports.js`, and `frontend/report.md`

**Checkpoint**: Nearby lookup failures cannot silently bypass duplicate prevention.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm privacy, flow ordering, and release readiness without adding persistence or a
new service.

- [X] T028 [P] Add a browser test proving stale location refresh re-runs the nearby lookup before any report details are unlocked in `tests/e2e/nearby-report-check.spec.ts` and `frontend/assets/js/report-flow.js`
- [X] T029 [P] Add backend and browser regression coverage proving cancellation/session reset discards nearby summaries and match decisions without persistence in `backend/tests/contract/nearby-reports.test.ts`, `tests/e2e/nearby-report-check.spec.ts`, and `frontend/assets/js/report-state.js`
- [X] T030 [P] Update deployment and validation documentation with the nearby-report endpoint, 30-day window, safe-summary mapping, and live-service manual verification boundary in `backend/README.md`, `frontend/README.md`, and `specs/002-nearby-report-check/quickstart.md`
- [X] T031 Execute and record all nearby-report quickstart scenarios against the local Jekyll site, Node.js backend, and mock target in `specs/002-nearby-report-check/quickstart.md`

---

## Dependencies & Execution Order

1. Complete **Phase 1: Setup**.
2. Complete **Phase 2: Foundational** before any story work.
3. Complete **Phase 3: US1** for the duplicate-prevention MVP.
4. Complete **Phase 4: US2** and **Phase 5: US3** after the shared lookup flow exists.
5. Complete **Phase 6: Polish** before release.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only.
- **US2 (P2)**: Depends on the lookup contract introduced by US1, but is independently testable with
  an empty result.
- **US3 (P3)**: Depends on the lookup contract introduced by US1, but is independently testable with
  an unavailable result and retry.

## Parallel Opportunities

### Setup and Foundation

- T002, T003, and T004 can run in parallel after T001 establishes configuration names.
- T006 and T007 can run in parallel after T005 defines the shared state shape.
- T009 can be authored in parallel with T006–T008 once fixture data is present.

### User Story 1

- T010, T011, and T012 can be authored in parallel after Phase 2.
- T013 and T017 can run in parallel; T014–T016 follow T013, while T018 follows T017.
- T019 follows T018 and the API route from T016.

### User Stories 2 and 3

- T020/T021 and T024/T025 can be authored in parallel after US1's contract is available.
- T022 and T026 affect separate result branches and can be implemented in parallel.
- T023 follows T022; T027 follows T026.

## Implementation Strategy

### MVP First

1. Add configuration, fixtures, safe models, and API boundary.
2. Implement the P1 reports-found list and resident duplicate decision.
3. Demonstrate that a matching decision makes no new-report submission request.
4. Add empty-result and unavailable/retry branches only after the matching branch is correct.

### Incremental Delivery

1. Deliver a private, complete nearby-report list and a resident-controlled stop decision.
2. Deliver no-results continuation.
3. Deliver fail-closed unavailable/retry behavior.
4. Validate stale-location lookup, cancellation/session cleanup, and documentation before release.
