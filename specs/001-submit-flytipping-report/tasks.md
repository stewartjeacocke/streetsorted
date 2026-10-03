---

description: "Task list for fly-tipping report submission"
---

# Tasks: Submit Fly-tipping Report

**Input**: Design documents from `/specs/001-submit-flytipping-report/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/report-submission.md`, `quickstart.md`

**Tests**: Backend contract/integration and browser-flow tests are included because the implementation
plan and quickstart require validation against a mock Love Clean Streets target. No automated test
may submit a report to the live civic service.

**Organization**: Tasks are grouped by user story so the P1 anonymous reporting flow can be built,
tested, and demonstrated as the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase once its dependencies are met.
- **[Story]**: User story served by the task.
- Every task includes an exact target path.

## Path Conventions

- Jekyll static frontend: `frontend/`
- Node.js 24 LTS backend: `backend/`
- Cross-tier browser tests: `tests/e2e/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the separate Jekyll frontend and single Node.js backend described in the plan.

- [X] T001 Create the Jekyll frontend scaffold and Ruby dependencies in `frontend/Gemfile`, `frontend/_config.yml`, and `frontend/.gitignore`
- [X] T002 Create the Node.js 24 LTS TypeScript backend scaffold and dependencies in `backend/package.json`, `backend/tsconfig.json`, and `backend/.gitignore`
- [X] T003 [P] Create the Jekyll base layout and static asset directories in `frontend/_layouts/default.html`, `frontend/assets/css/`, and `frontend/assets/js/`
- [X] T004 [P] Configure backend linting, formatting, test commands, and Node.js 24 LTS engine enforcement in `backend/package.json`, `backend/eslint.config.js`, and `backend/prettier.config.cjs`
- [X] T005 [P] Create the frontend page shell and report entry page in `frontend/index.md` and `frontend/report.md`
- [X] T006 [P] Create cross-tier Playwright configuration and test directory in `playwright.config.ts` and `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide safe backend boundaries and shared behavior required before the anonymous report
flow can contact the external service.

**⚠️ CRITICAL**: Complete this phase before implementing User Story 1.

- [X] T007 Create environment validation for backend port, allowed Jekyll-site origin, and target-service base URL in `backend/src/config.ts` and `backend/.env.example`
- [X] T008 [P] Implement structured log redaction that excludes report descriptions, precise coordinates, cookies, anti-forgery tokens, and target response bodies in `backend/src/middleware/logger.ts`
- [X] T009 [P] Implement strict CORS and common HTTP security middleware that permit only the configured Jekyll-site origin in `backend/src/middleware/security.ts`
- [X] T010 Create the Express application bootstrap, JSON payload limit, health route, error mapping, and middleware registration in `backend/src/app.ts` and `backend/src/server.ts`
- [X] T011 Create shared report schemas and state types for `category`, browser location, description, confirmation, and `confirmed`/`unconfirmed`/`failed` outcomes in `backend/src/domain/report.ts`
- [X] T012 Create a mock Love Clean Streets fixture service with anonymous-session, anti-forgery, validation, confirmed, and ambiguous-result fixtures in `backend/tests/fixtures/love-clean-streets/` and `backend/tests/support/mock-target.ts`
- [X] T013 Add foundational contract and security tests for origin rejection, invalid payload rejection, and log redaction in `backend/tests/contract/security.test.ts` and `backend/tests/unit/logger.test.ts`

**Checkpoint**: The frontend/backend boundary is configured, unsafe requests are rejected, sensitive
values are redacted, and the mock target can support story-specific tests.

---

## Phase 3: User Story 1 - Submit a fly-tipping report (Priority: P1) 🎯 MVP

**Goal**: A resident anonymously supplies mandatory browser location and a description, reviews a
fixed fly-tipping report, explicitly confirms it, and receives a confirmed or clearly unconfirmed
outcome from Love Clean Streets.

**Independent Test**: With the mock target enabled, a new browser session grants location permission,
adds a valid description, sees the fixed fly-tipping review, confirms once, and sees the returned
reference. No account sign-in, photo control, category picker, or persisted draft is involved.

### Tests for User Story 1

- [X] T014 [P] [US1] Add backend contract tests for `POST /api/reports`, including rejection when `confirmed` is not true, location is missing, description is invalid, or category is not `fly-tipping`, in `backend/tests/contract/report-submission.test.ts`
- [X] T015 [P] [US1] Add adapter integration tests for anonymous-session bootstrap, anti-forgery parsing, hard-coded category ID `16144`, confirmed result parsing, validation failure, and ambiguous target responses in `backend/tests/integration/love-clean-streets-adapter.test.ts`
- [X] T016 [P] [US1] Add browser-flow tests for location granted, fixed category, no photo/category controls, review, confirmed result, cancellation, denied-location retry, and unconfirmed outcome in `tests/e2e/report-flow.spec.ts`

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement the transient browser report-state module with `location-required`, `details-in-progress`, `review`, `submitting`, `confirmed`, `unconfirmed`, `failed`, and discard-on-cancel/session-end behavior in `frontend/assets/js/report-state.js`
- [X] T018 [P] [US1] Implement the Jekyll reporting form markup with fixed fly-tipping text, description field, no photo input, no category selector, location-required message, retry control, review region, and confirmation controls in `frontend/report.md` and `frontend/_layouts/default.html`
- [X] T019 [US1] Implement browser location permission, retry, immutable-location behavior, and disabled submission until a location is obtained in `frontend/assets/js/location.js` and `frontend/assets/js/report-flow.js`
- [X] T020 [US1] Implement description validation, review rendering, explicit confirmation, cancellation, in-memory-only draft disposal, and safe outcome messages in `frontend/assets/js/report-flow.js`
- [X] T021 [P] [US1] Implement the per-attempt Love Clean Streets HTTP client and transient cookie jar in `backend/src/adapters/love-clean-streets/client.ts`
- [X] T022 [US1] Implement anonymous-session bootstrap, report-form retrieval, and anti-forgery-token extraction in `backend/src/adapters/love-clean-streets/session.ts`
- [X] T023 [US1] Implement report-form construction using hard-coded target category ID `16144` for standard “Dumped or flytipped waste”; do not discover, persist, or expose the category ID to residents in `backend/src/adapters/love-clean-streets/submission.ts`
- [X] T024 [US1] Implement target confirmation/reference parsing and fail-closed normalization to `confirmed`, `unconfirmed`, or `failed` without exposing target HTML, cookies, tokens, stack traces, or precise location in `backend/src/adapters/love-clean-streets/outcome.ts`
- [X] T025 [US1] Implement the report-submission application service that validates the exact `ReportDraft` constraints, creates request-local target context, invokes the adapter, and discards report data/tokens/cookies after the response in `backend/src/services/report-submission-service.ts`
- [X] T026 [US1] Implement `POST /api/reports` to match `contracts/report-submission.md`, including HTTPS-origin assumptions, request validation, explicit `confirmed: true` enforcement, and safe responses in `backend/src/routes/reports.ts`
- [X] T027 [US1] Wire the Jekyll browser client to `POST /api/reports`, prevent duplicate submission while `submitting`, and render confirmed/reference, failed, and unconfirmed/retry states in `frontend/assets/js/report-api.js` and `frontend/assets/js/report-flow.js`
- [X] T028 [US1] Register the report route and run the complete browser flow against the mock target in `backend/src/app.ts` and `tests/e2e/report-flow.spec.ts`

**Checkpoint**: The P1 flow is independently demonstrable against the mock target with no live civic
reports created.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Harden the split deployment, validate documented flows, and prepare an authorized release
check without adding persistence, accounts, photos, manual location editing, or extra services.

- [X] T029 [P] Add backend Docker/runtime configuration pinned to Node.js 24 LTS and production-safe environment documentation in `backend/Dockerfile`, `backend/.dockerignore`, and `backend/README.md`
- [X] T030 [P] Add Jekyll build/deployment documentation, backend-origin configuration instructions, and static-site cache guidance in `frontend/README.md` and `frontend/_config.yml`
- [X] T031 [P] Add rate limiting and request-size safeguards for the submission endpoint without logging report content in `backend/src/middleware/rate-limit.ts` and `backend/src/app.ts`
- [X] T032 [P] Add a backend failure-safe check that treats target markup/form changes, missing anti-forgery fields, or incompatible hard-coded category ID `16144` as unconfirmed/failed rather than successful in `backend/src/adapters/love-clean-streets/submission.ts` and `backend/src/adapters/love-clean-streets/outcome.ts`
- [X] T033 Execute and record all quickstart validation scenarios against the local mock target in `specs/001-submit-flytipping-report/quickstart.md`
- [X] T034 Record the authorized manual release-check procedure for the live service, including verification that category ID `16144` remains standard “Dumped or flytipped waste,” in `specs/001-submit-flytipping-report/quickstart.md`

---

## Dependencies & Execution Order

1. Complete **Phase 1: Setup**.
2. Complete **Phase 2: Foundational**; it blocks all story work.
3. Complete **Phase 3: US1** to deliver the MVP.
4. Complete **Phase 4: Polish** before release.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only. It has no dependency on another user story.

## Parallel Opportunities

### Setup

- T003, T004, T005, and T006 can run in parallel after T001 and T002 establish their respective
  project roots.

### Foundational

- T008 and T009 can run in parallel after T007.
- T011 and T012 can run in parallel with T008/T009 after T007; T013 follows the relevant middleware,
  schema, and fixture tasks.

### User Story 1

- T014, T015, and T016 can be authored in parallel after T011 and T012.
- T017, T018, and T021 can run in parallel after Phase 2.
- T019 follows T017/T018; T020 follows T017–T019.
- T022–T024 form the adapter sequence after T021; T025 follows T022–T024; T026 follows T025.
- T027 follows T019/T020 and T026; T028 follows T027 and the relevant test tasks.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Implement the frontend location/details/review flow and the backend adapter/route for US1.
3. Run the P1 browser flow only against the mock target.
4. Demonstrate anonymous confirmed and unconfirmed outcomes before starting release hardening.

### Incremental Delivery

1. Establish static frontend and backend foundations with strict origin and logging controls.
2. Deliver the fixed-category, location-required, anonymous report flow.
3. Add target-change safety, rate limiting, deployment documentation, and quickstart evidence.
4. Perform only an authorized manual live-service compatibility check; do not automate live submissions.

---

## Phase 5: Convergence

- [X] T035 Implement out-of-area target outcome detection and resident-safe “cannot submit through this service” response, with mock-target coverage in `backend/src/adapters/love-clean-streets/outcome.ts`, `backend/tests/support/mock-target.ts`, and `backend/tests/integration/love-clean-streets-adapter.test.ts` per Edge Cases and US1/AC2 (missing)
- [X] T036 Make the Jekyll/Playwright mock-target harness executable under Node.js 24 LTS and Ruby/Bundler, then run and record the complete anonymous browser flow in `playwright.config.ts`, `tests/e2e/report-flow.spec.ts`, and `specs/001-submit-flytipping-report/quickstart.md` per US1/AC1, SC-001, T028, and T033 (partial)
- [X] T037 Enforce active-session location freshness before final confirmation, re-requesting browser location when `capturedAt` is stale, in `frontend/assets/js/report-flow.js`, `frontend/assets/js/location.js`, and `backend/src/domain/report.ts` per data-model: IncidentLocation.capturedAt (partial)
- [X] T038 Expand executable browser coverage for granted and denied location, retry, review, cancellation, confirmed, unconfirmed, fixed category, and absent photo/category controls in `tests/e2e/report-flow.spec.ts` per T016 and US1 acceptance scenarios (partial)
