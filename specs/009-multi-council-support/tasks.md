# Tasks: Multi-Council Love Clean Streets Support

**Input**: Design documents from `/specs/009-multi-council-support/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Tests are required by the specification's acceptance scenarios, measurable outcomes, profile-admission rules, and quickstart validation guide. Write/extend tests before the associated implementation and verify they fail for the intended missing behavior.

**Organization**: Tasks are grouped by user story so that each priority can be completed and demonstrated independently after the shared routing foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks once their listed prerequisites are complete.
- **[US#]**: User story served by the task; story labels appear only in user-story phases.
- Every task names its exact repository file path(s).

## Phase 1: Setup

**Purpose**: Establish the configuration and test fixture surface needed to develop the multi-council feature safely.

- [X] T001 [P] Add authority-lookup runtime configuration (`AUTHORITY_LOOKUP_BASE_URL` and optional `AUTHORITY_LOOKUP_API_KEY`) to `src/server/config.ts`, document non-secret example values in `.env.example`, and ensure the key is not logged or browser-delivered.
- [X] T002 [P] Add a multi-council fixture builder with independently addressable council and geographic-authority mock responses in `tests/server/support/mock-councils.ts`.
- [X] T003 [P] Extend local development setup documentation in `README.md` with the authority-lookup and multi-council mock-service commands required by `specs/009-multi-council-support/quickstart.md`.

---

## Phase 2: Foundational Routing and Profile Infrastructure

**Purpose**: Build the validated profile catalogue and fail-closed authority-routing primitives required by all user stories.

**⚠️ CRITICAL**: Complete this phase before implementing any user-story workflow. No report page, JSON endpoint, nearby lookup, or submission may select a council until these foundations exist.

- [X] T004 Define `CouncilProfile`, `AuthorityLookupResult`, and validation rules in `src/server/domain/council.ts`, including the invariants that an active profile has every required value, has at least one authority identifier, and that no active authority identifier belongs to more than one active profile.
- [X] T005 Implement the version-controlled active profile catalogue in `src/server/services/council-directory.ts` and populate profiles for every currently compatible public Love Clean Streets council with `id`, `displayName`, `authorityLookupIdentifiers`, `targetBaseUrl`, `nearbyReportsBaseUrl`, `flyTippingCategoryId`, and `outOfAreaMessage`; do not store boundary geometry or secrets.
- [X] T006 Add catalogue validation unit tests in `tests/server/unit/council-directory.test.ts` for duplicate active authority identifiers, disabled/incomplete profiles, public-only profile data, and matching only active profiles.
- [X] T007 Implement the MapIt-compatible authority adapter in `src/server/adapters/authority-lookup/mapit.ts` so outbound calls contain only decimal latitude and longitude, use the configured timeout and runtime-only credential, and classify malformed/network/non-success results as unavailable.
- [ ] T008 Add authority-adapter integration tests in `tests/server/integration/authority-lookup-adapter.test.ts` that assert the outbound request excludes description, report reference, session/cookie values, location accuracy, and other resident data.
- [X] T009 Implement assignment orchestration in `src/server/services/council-routing-service.ts`: map exactly one provider authority identifier to one active profile as `assigned`; return `unsupported` for no or multiple active matches; return `unavailable` for provider failures; never infer from display names.
- [X] T010 Add routing-service unit tests in `tests/server/unit/council-routing-service.test.ts` for assigned, unsupported, ambiguous, disabled-profile, malformed-result, and unavailable outcomes.
- [X] T011 Wire the council directory and routing service into application construction with testable dependency injection in `src/server/app.ts` and update configuration test coverage in `tests/server/contract/runtime-dependencies.test.ts`.

**Checkpoint**: Profile validation and authority routing are independently testable, data-minimizing, fail closed, and available to all existing entry points.

---

## Phase 3: User Story 1 - Report Fly-Tipping Through the Identified Council (Priority: P1) 🎯 MVP

**Goal**: A resident enters a location, is automatically assigned to exactly one active council, sees council-scoped nearby reports, and submits the existing fly-tipping journey to that council only.

**Independent Test**: Using two active mock profiles, submit an in-area coordinate for each through `/report` and the JSON routes. Verify the assigned profile alone supplies the nearby source, fly-tipping category, and reporting target; complete a confirmed submission for each.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add report-page contract tests for `POST /report/location` assigned routing (`303 /report/nearby`) and later-stage guards that require a fresh location and valid active council assignment in `tests/server/contract/report-pages.test.ts`.
- [ ] T013 [P] [US1] Add JSON contract tests in `tests/server/contract/nearby-reports.test.ts` and `tests/server/contract/report-submission.test.ts` proving both endpoints resolve the submitted coordinate before any council operation and never contact a council without an assignment.
- [ ] T014 [P] [US1] Extend profile-aware Love Clean Streets integration coverage in `tests/server/integration/love-clean-streets-adapter.test.ts` for two profiles with distinct targets and category identifiers, asserting no cross-council request is made.

### Implementation for User Story 1

- [X] T015 [US1] Extend `ReportDraftSession` and update logic in `src/server/services/report-draft-session-store.ts` with `councilProfileId` that is “Present only after an `assigned` result” and clear the council assignment, description, and nearby result whenever the location is replaced.
- [X] T016 [US1] Refactor fly-tipping category and relevant-nearby filtering in `src/server/domain/report.ts` and `src/server/domain/nearby-report.ts` to accept the assigned profile's positive `flyTippingCategoryId` instead of the fixed single-council category.
- [X] T017 [US1] Refactor nearby lookup to require an assigned `CouncilProfile` and use only its `nearbyReportsBaseUrl` and category mapping in `src/server/adapters/love-clean-streets/nearby-reports.ts` and `src/server/services/nearby-reports-service.ts`.
- [X] T018 [US1] Refactor anonymous Love Clean Streets submission to require an assigned `CouncilProfile`, use only its `targetBaseUrl` and `flyTippingCategoryId`, and preserve safe ambiguous-response classification in `src/server/adapters/love-clean-streets/submission.ts` and `src/server/services/report-submission-service.ts`.
- [X] T019 [US1] Resolve the council on a valid location post, persist only an assigned profile, clear prior council-scoped data on location replacement, and guard nearby/details/review/submit operations in `src/server/routes/report-pages.ts`.
- [X] T020 [US1] Resolve authority assignment before the existing JSON nearby and report actions, return safe non-success results for non-assigned outcomes, and pass the assigned profile through the services in `src/server/routes/nearby-reports.ts` and `src/server/routes/reports.ts`.
- [X] T021 [US1] Update multi-council mock behavior and fixture assertions for profile-specific nearby/category/submission targets in `tests/server/support/mock-target.ts` and `tests/server/support/mock-councils.ts`.
- [ ] T022 [US1] Add JavaScript-enabled end-to-end coverage for two automatically assigned councils, including distinct nearby data and confirmed submissions, in `tests/e2e/report-progressive-enhancement.spec.ts`.

**Checkpoint**: The MVP supports the current fly-tipping workflow for any active compatible profile and proves that no request is routed to a council other than the one assigned from the location.

---

## Phase 4: User Story 2 - Receive Council-Specific Report Outcomes (Priority: P2)

**Goal**: A resident receives safe, council-appropriate confirmed, out-of-area, rejected, and unconfirmed outcomes without any incorrect hard-coded council name or false submission claim.

**Independent Test**: Exercise accepted, out-of-area, validation-failure, and ambiguous outputs for two assigned profiles and verify the correct council context, reference behavior, retry rules, and restart path in both HTML and JSON responses.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add outcome-classification tests for profile-specific confirmed, failed, out-of-area, and unconfirmed messages in `tests/server/integration/love-clean-streets-adapter.test.ts`.
- [ ] T024 [P] [US2] Add report-page and JSON contract assertions that out-of-area responses never claim submission, never offer automatic duplicate submission, and restart at location resolution in `tests/server/contract/report-pages.test.ts` and `tests/server/contract/report-submission.test.ts`.

### Implementation for User Story 2

- [X] T025 [US2] Refactor target outcome parsing in `src/server/adapters/love-clean-streets/outcome.ts` to receive profile-safe council context, remove Islington-specific wording, and retain the `confirmed`, `failed`, and `unconfirmed` state rules.
- [X] T026 [US2] Pass assigned profile context through submission outcome handling in `src/server/services/report-submission-service.ts`, `src/server/routes/report-pages.ts`, and `src/server/routes/reports.ts` so every resident message applies only to the identified council.
- [X] T027 [US2] Add council-specific outcome, no-false-success, safe-retry, and location-resolution restart content to `src/server/views/report-pages.ts`.
- [ ] T028 [US2] Extend end-to-end outcome coverage for accepted, out-of-area, validation-failure, and ambiguous responses across two profiles in `tests/e2e/report-progressive-enhancement.spec.ts`.

**Checkpoint**: Every council response is classified safely, uses the assigned council's context, and protects residents from duplicate or misdirected submissions.

---

## Phase 5: User Story 3 - Understand the Council Identified for the Location (Priority: P3)

**Goal**: Residents can understand the authority assigned to their location, correct that location before confirmation, and recover safely when the location cannot be routed or the geographic lookup is unavailable.

**Independent Test**: Enter an assigned coordinate, observe the council through the subsequent report pages, replace it with a coordinate for another profile, and verify prior description/nearby data is discarded. Also verify unsupported and unavailable lookups preserve coordinates and expose only correction/retry/exit actions.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add page contract tests in `tests/server/contract/report-pages.test.ts` for `422` unsupported routing and `503` unavailable routing with retained latitude/longitude, correction/exit or retry/exit actions, and zero council-service calls.
- [ ] T030 [P] [US3] Add session-state unit tests in `tests/server/unit/report-draft-session.test.ts` for council assignment invalidation and the invariant that `nearbyCouncilProfileId` “must equal `councilProfileId` before a decision is accepted.”
- [ ] T031 [P] [US3] Add keyboard and JavaScript-disabled end-to-end scenarios for assigned-council visibility, location correction, unsupported routing, and temporary lookup outage in `tests/e2e/report-progressive-enhancement.spec.ts`.

### Implementation for User Story 3

- [X] T032 [US3] Update location, nearby, details, review, recovery, and outcome renderers in `src/server/views/report-pages.ts` to display the identified council, retain entered coordinates for routing failures, and provide ordinary-form correction, retry, and exit actions.
- [X] T033 [US3] Implement `400` invalid-coordinate, `422` unsupported-routing, and `503` unavailable-routing behavior while retaining coordinates and blocking council operations in `src/server/routes/report-pages.ts`.
- [X] T034 [US3] Enforce the council-scoped nearby-result binding in `src/server/services/report-draft-session-store.ts` and `src/server/routes/report-pages.ts` so a prior result cannot be accepted after a location or council change.
- [X] T035 [US3] Update `src/server/public/report.css` only as needed to make the identified-council indicator, routing messages, and correction/retry/exit actions readable and keyboard-focus-visible without changing the usable unstyled HTML order.

**Checkpoint**: Residents can see and correct automatic routing without JavaScript, while unsupported and unavailable location resolution remains safe and recoverable.

---

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Validate every active profile, enforce privacy/security constraints, and ensure documentation and full regression coverage are ready for release.

- [ ] T036 [P] Add a catalogue-wide compatibility test harness in `tests/server/integration/council-profile-compatibility.test.ts` that validates every active profile's in-area authority identifier, anonymous form compatibility, fly-tipping category, nearby filtering, and accepted/out-of-area/rejected/ambiguous classification fixtures.
- [ ] T037 [P] Add logging and privacy regression assertions in `tests/server/contract/security.test.ts` and `tests/server/unit/logger.test.ts` to ensure provider credentials, raw lookup payloads, descriptions, report references, session values, and location accuracy are absent from logs and resident pages.
- [X] T038 [P] Update `.env.example`, `README.md`, and `specs/009-multi-council-support/quickstart.md` with the final profile-catalogue admission, runtime configuration, mock-validation, and no-live-submission guidance.
- [X] T039 Run and resolve failures from `npm run lint`, `npm run format`, `npm test`, `npm run test:e2e`, and `npm run build`; record any required fixture or documentation corrections in the files identified by the failing command.

---

## Dependencies and Execution Order

```text
Phase 1 (T001–T003)
  → Phase 2 (T004–T011)
    → US1 / MVP (T012–T022)
      → US2 (T023–T028)
      → US3 (T029–T035)
        → Polish (T036–T039)
```

- **US1** depends on the shared routing/profile foundation and delivers the first usable multi-council reporting flow.
- **US2** depends on profile-aware submission from US1; it specializes outcome classification and presentation.
- **US3** depends on authority routing from US1 and may be implemented in parallel with US2 once T022 is complete, provided shared route/view edits are coordinated.
- **Polish** depends on the complete catalog, routing, outcome, and resident-experience work.

## Parallel Execution Examples

### Foundation

After T001–T003 are complete, T004/T005, T007/T008, and their respective tests can be split across workers with disjoint file ownership. T009 begins after the directory and lookup adapter are available.

### User Story 1

Run T012, T013, and T014 in parallel. After T015–T018 establish the data and adapters, route work in T019/T020 and fixture work in T021 can proceed in parallel; finish with T022.

### User Story 2

Run T023 and T024 in parallel, then implement T025–T027 before T028.

### User Story 3

Run T029, T030, and T031 in parallel, then coordinate the shared `src/server/routes/report-pages.ts` and `src/server/views/report-pages.ts` changes in T032–T035.

### Cross-cutting

Run T036, T037, and T038 in parallel before the complete verification task T039.

## Implementation Strategy

### MVP first (User Story 1)

1. Complete phases 1 and 2 to establish a secure, validated, fail-closed routing foundation.
2. Implement T012–T022 so two mock council profiles can receive independently routed nearby checks and submissions.
3. Run the US1 tests and demonstrate that no cross-council request occurs.

### Incremental delivery

1. Add US2 to make all target outcomes council-appropriate and safe.
2. Add US3 to make automatic assignment visible, correctable, accessible, and recoverable.
3. Complete cross-cutting catalogue, privacy, documentation, and full regression validation before release.
