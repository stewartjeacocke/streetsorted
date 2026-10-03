---

description: "Task list for React frontend and Node.js 26 migration"
---

# Tasks: Migrate React Frontend

**Input**: Design documents from `/specs/004-react-frontend/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/frontend-api.md`, `quickstart.md`

**Tests**: Unit, backend contract, and Playwright browser tests are included because the migration
must preserve the current report-flow behavior while replacing the frontend runtime.

**Organization**: Tasks are grouped by user story so the primary resident flow is delivered first,
then duplicate prevention and operational migration are completed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are complete.
- **[Story]**: User story served by the task.
- Every task includes an exact target path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish Node.js 26 and replace the former frontend build foundation.

- [X] T001 Upgrade Node engine declarations, runtime documentation, and root tooling scripts to Node.js 26 in `package.json`, `backend/package.json`, `backend/README.md`, and `README.md`
- [X] T002 [P] Update the backend production image and development/runtime metadata from Node.js 24 to Node.js 26 in `backend/Dockerfile`, `backend/.dockerignore`, and `backend/.env.example`
- [X] T003 Replace the Jekyll/Ruby frontend manifest with a Node.js 26 React/Vite manifest, TypeScript configuration, Vite configuration, and frontend ignore rules in `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, and `frontend/.gitignore`
- [X] T004 [P] Update root and frontend ignore rules to remove Ruby/Jekyll artifacts and include Node/Vite artifacts in `.gitignore` and `frontend/.gitignore`
- [X] T005 [P] Update Playwright web-server configuration to start the Vite frontend, existing mock target, and existing backend under Node.js 26 in `playwright.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the React application shell, transient state model, and backend-only API client
before resident-flow components are implemented.

**⚠️ CRITICAL**: Complete this phase before user-story work.

- [X] T006 Create the Vite entry document, React bootstrap, top-level application component, and shared stylesheet in `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, and `frontend/src/styles/app.css`
- [X] T007 Create the typed frontend API client for existing `GET /api/nearby-reports` and `POST /api/reports` contracts, including safe malformed-response handling, in `frontend/src/api/report-api.ts`
- [X] T008 Create the transient React report-flow reducer/hook with `location`, `nearby-loading`, `nearby-decision`, `details`, `review`, `submitting`, `outcome`, and `stopped` states; discard all data on reset/unmount in `frontend/src/hooks/useReportFlow.ts`
- [X] T009 [P] Create the browser-location utility with immutable location and five-minute freshness behavior in `frontend/src/lib/location.ts`
- [X] T010 [P] Add React unit-test configuration and state/API test setup in `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, and `frontend/package.json`
- [X] T011 Add regression assertions that backend origin restrictions, log redaction, request limits, and rate limiting remain unchanged under Node.js 26 in `backend/tests/contract/security.test.ts`, `backend/tests/unit/logger.test.ts`, and `backend/package.json`

**Checkpoint**: The React application can render, communicate only with the existing backend, and
hold no draft/nearby/outcome data beyond the mounted application.

---

## Phase 3: User Story 1 - Complete the reporting flow in the new frontend (Priority: P1) 🎯 MVP

**Goal**: A resident completes the no-match report journey using React without the prior static
frontend runtime.

**Independent Test**: With the mock target running, a resident grants location, selects no match,
adds details, confirms once, and sees the returned confirmation reference in the React frontend.

### Tests for User Story 1

- [X] T012 [P] [US1] Add React unit tests for location retry, stale-location refresh, draft reset, description validation, review, explicit confirmation, and safe outcome states in `frontend/src/hooks/useReportFlow.test.tsx`
- [X] T013 [P] [US1] Migrate the existing Playwright no-match submission, denied-location, cancellation, unconfirmed, and out-of-area scenarios to the React UI in `tests/e2e/report-flow.spec.ts`

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement the location permission and retry step component in `frontend/src/components/LocationStep.tsx`
- [X] T015 [P] [US1] Implement the report details component with required description validation and cancel action in `frontend/src/components/ReportDetailsStep.tsx`
- [X] T016 [P] [US1] Implement the review component with immutable location summary, description, edit, cancel, and explicit confirmation controls in `frontend/src/components/ReviewStep.tsx`
- [X] T017 [P] [US1] Implement the confirmed, failed, unconfirmed, out-of-area, and stopped outcome component in `frontend/src/components/OutcomeStep.tsx`
- [X] T018 [US1] Compose location, details, review, cancellation, stale-location refresh, and submission behavior through the reducer in `frontend/src/App.tsx` and `frontend/src/hooks/useReportFlow.ts`
- [X] T019 [US1] Connect the React report flow to the existing submission API contract and prevent duplicate submit calls while `submitting` in `frontend/src/api/report-api.ts` and `frontend/src/hooks/useReportFlow.ts`

**Checkpoint**: The React frontend independently completes the full no-match report journey with the
existing backend and mock target.

---

## Phase 4: User Story 2 - Prevent duplicate reports in the new frontend (Priority: P2)

**Goal**: Preserve filtered nearby-report review and stop reporting when a resident confirms a match.

**Independent Test**: With relevant nearby reports returned, the resident sees safe summaries, selects
match, sees the stopped outcome, and no report submission call occurs.

### Tests for User Story 2

- [X] T020 [P] [US2] Add React unit tests for reports-found, no-results, unavailable/retry, match-stop, no-match, and nearby-state discard behavior in `frontend/src/hooks/useReportFlow.test.tsx`
- [X] T021 [P] [US2] Migrate existing Playwright nearby-report scenarios, including filtered reports, no-results, unavailable/retry, stale refresh, and match-stop/no-submission assertions, to `tests/e2e/nearby-report-check.spec.ts`

### Implementation for User Story 2

- [X] T022 [US2] Implement the nearby-report loading, safe-summary list, match/no-match decision, no-results, unavailable/retry, and cancel component in `frontend/src/components/NearbyReportsStep.tsx`
- [X] T023 [US2] Wire fresh-location lookup to the existing nearby API, block details/review/submission while pending or unavailable, and stop/discard on match in `frontend/src/hooks/useReportFlow.ts` and `frontend/src/App.tsx`
- [X] T024 [US2] Verify React renders only backend-provided safe summaries and contains no council-service client calls in `frontend/src/api/report-api.ts`, `frontend/src/components/NearbyReportsStep.tsx`, and `frontend/src/App.tsx`

**Checkpoint**: Duplicate prevention works in the React frontend and uses the current backend filter
without a direct council-service integration.

---

## Phase 5: User Story 3 - Build and operate the migrated project (Priority: P3)

**Goal**: A maintainer operates the React/frontend and backend project entirely with Node.js 26 and no
supported Ruby/Jekyll workflow.

**Independent Test**: Following the updated documentation with Node.js 26, a maintainer installs,
builds, starts, and tests the frontend, backend, mock target, and browser suite.

### Tests for User Story 3

- [X] T025 [P] [US3] Add Node.js 26 engine and frontend production-build checks to CI/local test scripts in `package.json`, `frontend/package.json`, and `backend/package.json`
- [X] T026 [P] [US3] Add Playwright startup verification for Vite plus the existing backend/mock-target stack in `playwright.config.ts` and `tests/e2e/report-flow.spec.ts`

### Implementation for User Story 3

- [X] T027 [US3] Update backend runtime dependencies, TypeScript Node typings, engine range, Docker image, and production startup validation for Node.js 26 in `backend/package.json`, `backend/package-lock.json`, `backend/Dockerfile`, and `backend/tsconfig.json`
- [X] T028 [US3] Remove Jekyll layouts, pages, assets, Gemfile, lockfile, Ruby configuration, and Ruby documentation from `frontend/` and replace them with the React/Vite supported delivery path in `frontend/` and `frontend/README.md`
- [X] T029 [US3] Update root, frontend, backend, and feature validation documentation with Node.js 26 installation/build/test/run commands in `README.md`, `frontend/README.md`, `backend/README.md`, and `specs/004-react-frontend/quickstart.md`

**Checkpoint**: The only supported frontend workflow is React/Vite on Node.js 26; Ruby/Jekyll is not a
supported dependency or resident-facing path.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate migration completeness, privacy, and absence of obsolete delivery paths.

- [X] T030 [P] Verify cancellation and page refresh never restore report drafts, nearby results, or decisions in `frontend/src/hooks/useReportFlow.ts` and `tests/e2e/report-flow.spec.ts`
- [X] T031 [P] Verify production frontend configuration exposes only the backend API origin and never a council-service origin in `frontend/vite.config.ts`, `frontend/src/api/report-api.ts`, and `frontend/.env.example`
- [X] T032 Remove obsolete Jekyll/Ruby references from ignore files, Playwright commands, project documentation, and package scripts in `.gitignore`, `frontend/.gitignore`, `playwright.config.ts`, `README.md`, and `frontend/README.md`
- [X] T033 Run and record Node.js 26 backend build/test/lint/format, React unit tests, React production build, and complete Playwright suite in `specs/004-react-frontend/quickstart.md`

---

## Dependencies & Execution Order

1. Complete Setup and Foundational phases.
2. Complete US1 for the React resident-flow MVP.
3. Complete US2 to restore duplicate prevention.
4. Complete US3 to retire Jekyll/Ruby and standardize Node.js 26.
5. Complete Polish before release.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only.
- **US2 (P2)**: Depends on the React state/API foundation and may follow US1 components.
- **US3 (P3)**: Depends on a working React frontend so it can retire the Jekyll path safely.

## Parallel Opportunities

- T002–T005 can run in parallel after T001 establishes the Node.js 26 baseline.
- T009 and T010 can run in parallel with T007/T008.
- T012/T013 can be authored in parallel after Phase 2.
- T014–T017 can be implemented in parallel before T018 composes them.
- T020/T021 can be authored in parallel; T022 and T023 then integrate the nearby flow.
- T025/T026 and T027 can run in parallel after the React frontend is working.

## Implementation Strategy

### MVP First

1. Create the Node.js 26 React/Vite foundation.
2. Implement the no-match report journey and outcome handling.
3. Prove the existing backend/mock-target report submission works through React.

### Incremental Delivery

1. Deliver the primary report journey.
2. Restore nearby-report duplicate prevention.
3. Upgrade backend/runtime tooling to Node.js 26 and remove Jekyll/Ruby.
4. Run all unit, backend, production-build, and browser validation before release.
