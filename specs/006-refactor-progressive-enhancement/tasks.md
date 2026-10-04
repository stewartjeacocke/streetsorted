---
description: "Actionable task list for the progressive-enhancement report-flow refactor"
---

# Tasks: Refactor Client for Progressive Enhancement

**Input**: Design documents from `/specs/006-refactor-progressive-enhancement/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and
`contracts/report-pages.md`

**Tests**: Required. The specification requires automated JavaScript-disabled end-to-end coverage
and tests for all primary, duplicate, validation, recovery, cancellation, expiry, and retry paths.

**Organization**: Tasks are grouped by user story so each increment has a defined independent test.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel with other marked tasks once its stated prerequisites are done.
- **[Story]**: User story served by the task. Shared setup/foundation and polish tasks omit it.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Retire the SPA build and prepare the framework-free server-rendered asset pipeline.

- [X] T001 Remove React, React DOM, React type packages, React Testing Library, and obsolete client
  build/test scripts from `package.json`; regenerate `package-lock.json` without those dependencies.
- [X] T002 Remove `tsconfig.client.json`, `src/client/`, and the obsolete client build implementation
  in `src/server/dev/client-build.ts` after confirming no remaining imports reference them.
- [X] T003 Replace the retired client build with static-asset copy support for CSS and the optional
  location helper in `src/server/dev/static-assets.ts`; wire it into `package.json` build and dev
  scripts and `src/server/dev-server.ts`.
- [X] T004 Update `README.md` to describe the server-rendered `/report` flow, the optional
  location helper, and the revised build/test commands without referring to a React application.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create safe session, HTML rendering, static-asset, and route foundations shared by all
report pages.

**⚠️ CRITICAL**: Complete this phase before implementing user-story page flows.

- [X] T005 [P] Add failing unit tests for five-minute inactivity expiry, immediate cancellation and
  terminal-outcome deletion, permitted retryable-outcome retention, and valid stage transitions in
  `tests/server/unit/report-draft-session.test.ts`.
- [X] T006 [P] Add failing unit tests for HTML text/attribute escaping, layout semantics, and safe
  rendering of validation and upstream-result text in `tests/server/unit/html-views.test.ts`.
- [X] T007 [P] Add failing unit tests for opaque session-cookie parsing, `HttpOnly`/`SameSite=Lax`
  cookie settings, and CSRF rejection of missing, expired, invalid, and mismatched form tokens in
  `tests/server/unit/report-session.test.ts`.
- [X] T008 Implement the in-memory report draft-session store with opaque IDs, CSRF tokens, `location`,
  `nearby`, `details`, and `review` stages, and five-minute inactivity cleanup in
  `src/server/services/report-draft-session-store.ts`.
- [X] T009 Implement report session creation/loading, secure cookie emission, activity refresh, and
  CSRF form validation middleware in `src/server/middleware/report-session.ts`.
- [X] T010 Implement framework-free HTML escaping, shared document layout, status/error components,
  and recovery-page rendering in `src/server/views/html.ts`.
- [X] T011 Move reusable report styles to `src/server/public/report.css` and add the optional
  location-only helper at `src/server/public/location-helper.js`; ensure the helper only fills visible
  latitude/longitude fields and never fetches, routes, submits, or stores report data.
- [X] T012 Configure URL-encoded form parsing, server static-asset serving, report-session cleanup,
  and report-route registration while preserving existing `/api` JSON routes in `src/server/app.ts`.

**Checkpoint**: Sessions, CSRF, escaped static HTML, styles, and framework-free asset delivery are
ready. All existing `/api` behavior remains available.

---

## Phase 3: User Story 1 - Submit a Report Without JavaScript (Priority: P1) 🎯 MVP

**Goal**: Let a resident manually enter a location, supply a description, review it, explicitly
confirm, and receive a submission outcome through ordinary HTML pages and forms.

**Independent Test**: With JavaScript disabled, a resident can complete the valid manual-location
journey from `GET /report` through a confirmed submission outcome using only page navigation and
forms.

### Tests for User Story 1

- [X] T013 [P] [US1] Add failing server page-contract tests for `GET /report`, `POST /report/location`,
  `GET/POST /report/details`, `GET /report/review`, `POST /report/review/edit`, and `POST /report/submit`
  in `tests/server/contract/report-pages.test.ts`.
- [X] T014 [P] [US1] Add a failing JavaScript-disabled Playwright manual-location, details, review,
  explicit-confirmation, and confirmed-outcome journey in
  `tests/e2e/report-progressive-enhancement.spec.ts`.

### Implementation for User Story 1

- [X] T015 [US1] Add form-specific location and description validation that preserves the existing
  location bounds, existing freshness rule, and trimmed required description with a maximum length
  of **1,000 characters** in `src/server/domain/report-page-forms.ts`.
- [X] T016 [US1] Implement escaped server-rendered location, details, review, confirmed-outcome, and
  recovery views with semantic labels, field-specific errors, standard forms, and CSRF fields in
  `src/server/views/report-pages.ts`.
- [X] T017 [US1] Implement `GET /report`, `POST /report/location`, `GET/POST /report/details`,
  `GET /report/review`, `POST /report/review/edit`, and `POST /report/submit` in
  `src/server/routes/report-pages.ts`; reuse existing submission/domain services, require explicit
  confirmation, clear terminal drafts, and render the outcome directly.
- [X] T018 [US1] Register the completed report-page router and update server contract fixtures in
  `src/server/app.ts` and `tests/server/contract/report-pages.test.ts` until the manual no-JavaScript
  P1 journey passes without a client bundle.

**Checkpoint**: A resident can submit a report with JavaScript disabled; no React dependency, SPA
shell, client-side route, or browser-stored draft remains.

---

## Phase 4: User Story 2 - Complete the Duplicate-Report Decision Without JavaScript (Priority: P2)

**Goal**: Let a resident inspect nearby reports, exit without submission when one matches, or continue
to the P1 details flow when no match exists.

**Independent Test**: With JavaScript disabled and an active location draft, a resident sees sanitized
nearby results, can declare a match without creating a report, and can continue after no results.

### Tests for User Story 2

- [X] T019 [P] [US2] Add failing server page-contract tests for `GET /report/nearby`,
  `POST /report/nearby/retry`, and `POST /report/nearby/decision`, including found, none, unavailable,
  retry, match, and continue outcomes in `tests/server/contract/report-pages.test.ts`.
- [X] T020 [P] [US2] Add failing JavaScript-disabled Playwright journeys for nearby match exit,
  no-results continuation, and unavailable lookup retry in
  `tests/e2e/report-progressive-enhancement.spec.ts`.

### Implementation for User Story 2

- [X] T021 [US2] Extend `src/server/views/report-pages.ts` with escaped, sanitized nearby-report,
  no-results, unavailable, and no-submission-outcome pages that retain the active location context
  without exposing it in URLs.
- [X] T022 [US2] Add `GET /report/nearby`, `POST /report/nearby/retry`, and
  `POST /report/nearby/decision` to `src/server/routes/report-pages.ts`; use the existing nearby
  service, preserve `found`/`none`/`unavailable` state, clear the draft on a match, and redirect only
  to allowed next pages.
- [X] T023 [US2] Complete the nearby flow assertions in `tests/server/contract/report-pages.test.ts`
  and `tests/e2e/report-progressive-enhancement.spec.ts`, including the guarantee that the match
  path makes no submission request.

**Checkpoint**: Duplicate avoidance and nearby-service recovery work entirely through server-rendered
HTML pages and standard forms.

---

## Phase 5: User Story 3 - Navigate Resilient Reporting Pages (Priority: P3)

**Goal**: Make Back, refresh, direct URLs, cancellation, draft expiry, and retryable submission
outcomes safe and understandable without a reporting-page script.

**Independent Test**: A resident can refresh or navigate Back with a valid draft, while direct,
expired, or out-of-sequence requests receive recovery guidance and cannot submit a report.

### Tests for User Story 3

- [X] T024 [P] [US3] Add failing server contract tests for missing/expired/out-of-sequence drafts,
  cancellation, CSRF failures, review edit, terminal deletion, and retryable submission retention in
  `tests/server/contract/report-pages.test.ts`.
- [X] T025 [P] [US3] Add failing Playwright coverage for Back/refresh, direct intermediate URLs,
  cancellation, expiry after five minutes, optional geolocation fallback, and retryable submission in
  `tests/e2e/report-progressive-enhancement.spec.ts`.

### Implementation for User Story 3

- [X] T026 [US3] Add draft-expiry cleanup, last-valid-stage recovery, cancellation, and retryable
  submission handling to `src/server/services/report-draft-session-store.ts` and
  `src/server/routes/report-pages.ts`; reject stale locations using the existing freshness rule before
  review or submission.
- [X] T027 [US3] Extend `src/server/views/report-pages.ts` with direct-link/expired-draft recovery,
  cancellation confirmation, retryable outcome, and optional-geolocation fallback messaging.
- [X] T028 [US3] Complete resilience and security assertions in
  `tests/server/contract/report-pages.test.ts` and
  `tests/e2e/report-progressive-enhancement.spec.ts`, including no client-side routing, no browser
  storage, and absence of report location/description from URLs and client-visible logs.

**Checkpoint**: All valid browser navigation paths survive without JavaScript, and invalid state is
recovered safely without unintended submission or data exposure.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify complete React removal, security boundaries, and production-quality validation.

- [X] T029 [P] Add package/build regression assertions in `tests/server/contract/runtime-dependencies.test.ts`
  that verify no React/React DOM/React test/type dependency, JSX config, client bundle, or SPA fallback
  remains.
- [X] T030 [P] Add focused logger-redaction coverage for draft-session identifiers, CSRF tokens,
  location, and description in `tests/server/unit/logger.test.ts`.
- [X] T031 Update `README.md` and `.env.example` only if needed to document the final report-page
  runtime, session/cookie behavior, and any required secure deployment setting.
- [X] T032 Run the quickstart scenarios and the complete validation suite (`npm test`, `npm run lint`,
  `npm run test:e2e`, and production `npm run build`) documented in
  `specs/006-refactor-progressive-enhancement/quickstart.md`; fix any regressions in the affected
  source or test file.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately. T001–T003 are sequential retirement/build work; T004 can
  proceed after T001 confirms the revised scripts.
- **Phase 2 (Foundational)**: Starts after Phase 1. T005–T007 may run in parallel; T008–T012 follow
  their corresponding failing tests and establish shared prerequisites.
- **Phase 3 (US1 / MVP)**: Starts after Phase 2. T013 and T014 may run in parallel; T015–T018 then
  deliver the complete manual report journey.
- **Phase 4 (US2)**: Starts after the US1 route/view foundation. T019 and T020 may run in parallel;
  T021–T023 extend the same page router and views.
- **Phase 5 (US3)**: Starts after US1 and US2 flow routes exist. T024 and T025 may run in parallel;
  T026–T028 complete cross-flow recovery and security behavior.
- **Phase 6 (Polish)**: Starts after all required stories are complete. T029 and T030 may run in
  parallel; T031–T032 finish documentation and end-to-end validation.

### User Story Dependencies

- **US1 (P1)**: Depends only on foundation and is the MVP.
- **US2 (P2)**: Reuses the session, views, and page router from US1 but is independently verifiable
  from an active location draft.
- **US3 (P3)**: Reuses all report steps to validate recovery, expiry, cancellation, and retry behavior.

### Parallel Opportunities

- Foundational test files T005–T007 are independent.
- For each story, the server-contract and browser end-to-end tests may be authored in parallel
  (T013/T014, T019/T020, T024/T025).
- The package-removal regression test T029 and logger-redaction test T030 are independent polish work.

## Parallel Example: User Story 1

```text
Task: "T013 contract tests in tests/server/contract/report-pages.test.ts"
Task: "T014 JavaScript-disabled browser journey in tests/e2e/report-progressive-enhancement.spec.ts"
```

## Implementation Strategy

### MVP First (US1)

1. Retire the SPA and React dependencies in Phase 1.
2. Complete sessions, CSRF, escaped HTML views, and static assets in Phase 2.
3. Implement only US1 in Phase 3.
4. Stop and verify the manual report submission with JavaScript disabled before adding nearby results
   or resilience enhancements.

### Incremental Delivery

1. Deliver US1: manual server-rendered reporting and confirmed submission.
2. Deliver US2: duplicate avoidance and nearby-result recovery.
3. Deliver US3: browser-navigation resilience, expiry, cancellation, and retry behavior.
4. Complete React-removal and full-suite checks in Phase 6.

## Notes

- Every task uses the required checklist format with an ID and exact file path.
- `[P]` tasks target separate files or independently authored tests; unmarked tasks intentionally
  sequence changes to the same router, views, or package/build configuration.
- Do not introduce an additional service, queue, database, browser storage, SPA fallback, client-side
  router, or reporting-page JavaScript beyond the optional location helper.

## Phase 7: Convergence

- [X] T033 Fix the retryable submission form in `src/server/views/report-pages.ts` to include the
  explicit confirmation value required by `src/server/routes/report-pages.ts`, and add successful
  retry coverage in `tests/server/contract/report-pages.test.ts` and
  `tests/e2e/report-progressive-enhancement.spec.ts` per FR-003 (partial)
