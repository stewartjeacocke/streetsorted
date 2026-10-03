# Tasks: Display Nearby Location

**Input**: Design documents from `/specs/005-display-nearby-location/`

## Phase 1: Setup

- [X] T001 Confirm the existing React report-flow location state remains the sole source of lookup coordinates in `frontend/src/hooks/useReportFlow.ts`

---

## Phase 2: Foundational

- [X] T002 Create a reusable five-decimal coordinate formatter that returns no display value for an absent location in `frontend/src/lib/location.ts`
- [X] T003 [P] Add unit coverage for five-decimal formatting and absent-location behavior in `frontend/src/lib/location.test.ts`

---

## Phase 3: User Story 1 - View the detected lookup location (Priority: P1) 🎯 MVP

**Goal**: Display the current detected latitude and longitude while the nearby-report step is active.

**Independent Test**: A resident with a detected location sees five-decimal latitude and longitude on
the nearby-report step; refresh, cancellation, and failed location paths show no stale values.

- [X] T004 [P] [US1] Add component/unit coverage for current, refreshed, and absent displayed lookup coordinates in `frontend/src/components/NearbyReportsStep.test.tsx` and `frontend/src/hooks/useReportFlow.test.tsx`
- [X] T005 [P] [US1] Add Playwright coverage that verifies five-decimal coordinate display, full-precision nearby lookup request values, refresh replacement, and reset cleanup in `tests/e2e/nearby-report-check.spec.ts`
- [X] T006 [US1] Render labelled five-decimal latitude and longitude from the current transient location in `frontend/src/components/NearbyReportsStep.tsx`
- [X] T007 [US1] Pass the current location to the nearby-report component and clear its display through existing reset/location-failure transitions in `frontend/src/App.tsx` and `frontend/src/hooks/useReportFlow.ts`

**Checkpoint**: The nearby-report step visibly identifies the exact detected lookup context without
changing backend requests or retaining coordinates after reset.

---

## Phase 4: Polish & Validation

- [X] T008 [P] Confirm no coordinate display value is added to frontend storage, backend contracts, or logs in `frontend/src/api/report-api.ts`, `backend/src/middleware/logger.ts`, and `frontend/src/components/NearbyReportsStep.tsx`
- [X] T009 Run and record React unit tests, frontend build, backend tests, and Playwright location-display scenarios in `specs/005-display-nearby-location/quickstart.md`

## Dependencies & Execution Order

1. Complete T001–T003.
2. Complete T004–T007 for the P1 display flow.
3. Complete T008–T009 before release.

## Parallel Opportunities

- T003 can run after T002.
- T004 and T005 can be authored in parallel after the formatter contract is defined.
- T006 and T007 are sequential integration tasks.

## Implementation Strategy

Implement the formatter and unit coverage first, then render the derived values in the existing
nearby component, verify full-precision lookup behavior, and run the regression suite.
