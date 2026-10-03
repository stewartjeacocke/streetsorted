---

description: "Task list for backend nearby-report filtering"
---

# Tasks: Filter Nearby Reports

**Input**: Design documents from `/specs/003-filter-nearby-reports/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/nearby-report-filter.md`, `quickstart.md`

**Tests**: Adapter, API-contract, and existing browser regression tests are included because the
quickstart requires validation of mixed, fully filtered, and incomplete external results.

**Organization**: Tasks are grouped by user story. All functional filtering happens in the existing
Node.js backend; the frontend consumes its existing list/no-results contract unchanged.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated dependencies are complete.
- **[Story]**: User story served by the task.
- Every task includes an exact target path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add target-like classification fixtures for backend-only filtering work.

- [X] T001 Add mixed, all-filtered, and incomplete-classification nearby-report fixtures containing `CategoryId`, `Completed`, and status labels in `backend/tests/fixtures/love-clean-streets/nearby-reports/`
- [X] T002 Extend the local mock nearby-report response cases to expose active fly-tipping, completed fly-tipping, non-fly-tipping, and missing classification records in `backend/src/dev/mock-target-app.ts` and `backend/tests/support/mock-target.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the request-local classification predicate shared by the nearby-report adapter and
its tests.

**⚠️ CRITICAL**: Complete this phase before user-story implementation.

- [X] T003 Create raw nearby-report classification types and a relevance predicate in `backend/src/domain/nearby-report.ts` requiring `CategoryId` to equal `16144` and `Completed` to be the boolean value `false`; do not use `StatusName` as a filtering input
- [X] T004 [P] Add unit coverage for category/completion relevance decisions, including missing or invalid category/completion values, in `backend/tests/unit/nearby-report-filter.test.ts`
- [X] T005 Update safe-summary mapping boundaries so excluded raw reports cannot reach the response or logs in `backend/src/adapters/love-clean-streets/nearby-reports.ts` and `backend/tests/unit/logger.test.ts`

**Checkpoint**: The backend has one testable predicate for active fly-tipping relevance and preserves
existing privacy controls.

---

## Phase 3: User Story 1 - Review relevant open fly-tipping reports (Priority: P1) 🎯 MVP

**Goal**: Return every active fly-tipping nearby report, in target order, while hiding completed and
non-fly-tipping reports before frontend serialization.

**Independent Test**: With a mixed target response, the backend returns every record with
`CategoryId=16144` and `Completed=false`, returns no other records, and preserves order.

### Tests for User Story 1

- [X] T006 [P] [US1] Add adapter integration coverage that verifies only `CategoryId=16144` and `Completed=false` records are retained in target order in `backend/tests/integration/nearby-reports-adapter.test.ts`
- [X] T007 [P] [US1] Add `GET /api/nearby-reports` contract coverage that verifies filtered summaries contain no completed or non-fly-tipping records in `backend/tests/contract/nearby-reports.test.ts`
- [X] T008 [P] [US1] Add a browser regression that confirms the existing nearby match/no-match decision appears for the backend-filtered relevant list in `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Apply the relevance predicate before safe-summary mapping in `backend/src/adapters/love-clean-streets/nearby-reports.ts`; retain every qualifying record without a cap or pagination
- [X] T010 [US1] Reuse `flyTippingCategoryId` from `backend/src/domain/report.ts` rather than duplicating `16144` in `backend/src/adapters/love-clean-streets/nearby-reports.ts`
- [X] T011 [US1] Verify `backend/src/services/nearby-reports-service.ts` and `backend/src/routes/nearby-reports.ts` preserve the existing `reports-found` response contract after filtering

**Checkpoint**: Only active fly-tipping reports reach the existing duplicate-decision flow.

---

## Phase 4: User Story 2 - Continue when filtering removes all reports (Priority: P2)

**Goal**: Return the existing no-results response when the target provided reports but none qualify
as active fly-tipping reports.

**Independent Test**: With only completed fly-tipping or non-fly-tipping target records, the API
returns `no-results` and the frontend can continue through its existing no-results path.

### Tests for User Story 2

- [X] T012 [P] [US2] Add adapter and route tests for an all-filtered target response returning the existing `no-results` shape in `backend/tests/integration/nearby-reports-adapter.test.ts` and `backend/tests/contract/nearby-reports.test.ts`
- [X] T013 [P] [US2] Add a browser regression for an all-filtered backend result using the existing no-results continuation path in `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 2

- [X] T014 [US2] Ensure an empty post-filter collection is normalized to the existing `no-results` result without exposing filtered target data in `backend/src/services/nearby-reports-service.ts`

**Checkpoint**: Closed or unrelated reports never block a legitimate new fly-tipping report.

---

## Phase 5: User Story 3 - Handle incomplete report classifications safely (Priority: P3)

**Goal**: Exclude nearby target records whose category or completion state cannot establish an active
fly-tipping report.

**Independent Test**: With missing, blank, non-numeric, or non-boolean category/completion fields,
the backend omits those records and returns the result based only on valid qualifying records.

### Tests for User Story 3

- [X] T015 [P] [US3] Add adapter and contract coverage for missing or invalid `CategoryId` and `Completed` values, including no leakage of excluded fields, in `backend/tests/integration/nearby-reports-adapter.test.ts` and `backend/tests/contract/nearby-reports.test.ts`

### Implementation for User Story 3

- [X] T016 [US3] Fail closed for missing or invalid category/completion fields in `backend/src/domain/nearby-report.ts` and `backend/src/adapters/love-clean-streets/nearby-reports.ts` while leaving `StatusName` display-only

**Checkpoint**: Ambiguous classifications cannot appear as active duplicate candidates.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm backend-only scope, privacy, and regression safety.

- [X] T017 [P] Update filtering behavior and the no-status-label rule in `backend/README.md` and `specs/003-filter-nearby-reports/quickstart.md`
- [X] T018 Run and record backend build, unit/contract/integration tests, Jekyll build, and browser regression suite in `specs/003-filter-nearby-reports/quickstart.md`

---

## Dependencies & Execution Order

1. Complete Setup and Foundational phases.
2. Complete US1 for the active fly-tipping filter MVP.
3. Complete US2 and US3 after the predicate exists.
4. Complete Polish before release.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only.
- **US2 (P2)**: Depends on US1's backend predicate and empty-result handling.
- **US3 (P3)**: Depends on Phase 2 and can be tested independently from US2.

## Parallel Opportunities

- T001 and T002 can run in parallel.
- T004 and T005 can run in parallel after T003.
- T006, T007, and T008 can be authored in parallel after Phase 2.
- T012/T013 and T015 can run in parallel after the P1 predicate is implemented.
- T017 can run in parallel with final validation preparation.

## Implementation Strategy

### MVP First

1. Introduce the category/completion predicate.
2. Filter raw target reports before safe-summary mapping.
3. Prove mixed results expose only active fly-tipping reports.

### Incremental Delivery

1. Deliver active fly-tipping backend filtering.
2. Validate all-filtered no-results continuation.
3. Validate missing/invalid classification exclusion.
4. Run full regression validation without changing frontend filtering behavior.
