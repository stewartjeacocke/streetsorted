---

description: "Actionable implementation tasks for postcode location input"
---

# Tasks: Postcode Location Input

**Input**: Design documents from `/specs/011-postcode-location-input/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/report-location.md`, and `quickstart.md`

**Tests**: Targeted unit, integration, contract, and end-to-end tests are included to prove the
specified resident flows, privacy constraints, and progressive-enhancement fallback.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and
demonstrated independently after the shared postcode-resolution foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can be completed in parallel with other marked tasks once their phase prerequisites are met.
- **[Story]**: User story from `spec.md`; omitted only for setup, foundational, and polish work.
- Every task names its exact target file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the selected postcode client dependency and the local typing boundary needed by the
strict TypeScript server build.

- [X] T001 Add `node-postcodes.io` version 1.0.3 to runtime dependencies in `package.json` and refresh `package-lock.json` without introducing a new service or client bundle.
- [X] T002 Add the minimal CommonJS module declaration for the selected client in `src/server/types/node-postcodes.io.d.ts`, covering only `lookup()` and `geo()` response envelopes used by the postcode adapter.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the server-only postcode resolution boundary, transient draft shape, and privacy
protection shared by every user story.

**⚠️ CRITICAL**: Complete this phase before starting user-story phases.

- [X] T003 Define normalized full-UK-postcode input, resolved-location, suggestion, and provider-outcome types in `src/server/domain/postcode.ts`; enforce: “Required full UK postcode. Trim surrounding whitespace, tolerate casing/spacing variations, and use the provider's canonical uppercase postcode for display and storage in the transient draft.”
- [X] T004 Define the postcode lookup port and implement the `node-postcodes.io` adapter in `src/server/adapters/postcode-lookup/postcodes-io.ts`; convert provider envelopes into typed `resolved`, `not-found`, and `unavailable` outcomes without leaking provider types to routes.
- [X] T005 Implement submitted-postcode resolution and browser-coordinate reverse-geocoding in `src/server/services/postcode-location-service.ts`; use one closest result for suggestions and validate finite coordinate ranges before provider calls.
- [X] T006 Extend `ReportDraftSession` and `resetLocation` in `src/server/services/report-draft-session-store.ts` with an optional canonical `postcode`; set it with a successful resolved location and clear/replace it through the existing reset, cancel, completion, and expiry lifecycle.
- [X] T007 Expand sensitive-field redaction in `src/server/middleware/logger.ts` to redact `postcode` alongside the existing latitude, longitude, accuracy, CSRF, session, and report data protections.
- [X] T008 [P] Add adapter integration coverage in `tests/server/integration/postcodes-io-adapter.test.ts` for canonical lookup, nearest-postcode reverse geocoding, provider not-found envelopes, and unavailable outcomes using mocked provider calls.
- [X] T009 [P] Add domain/service coverage in `tests/server/unit/postcode-location-service.test.ts` for canonical full-postcode resolution, “partial (area or district only)” rejection, invalid suggestion coordinates, first-result selection, and unavailable-provider mapping.
- [X] T010 [P] Extend `tests/server/unit/report-draft-session.test.ts` and `tests/server/unit/logger.test.ts` to prove postcode draft lifecycle clearing and postcode redaction.

**Checkpoint**: The application has a typed, test-covered server-only postcode boundary; location data
remains transient and redacted, so user-story flows can be built safely.

---

## Phase 3: User Story 1 - Enter a report location by postcode (Priority: P1) 🎯 MVP

**Goal**: Let a resident submit a full UK incident postcode through the server-rendered report flow,
without seeing or entering coordinates, while retaining current downstream coordinate integrations.

**Independent Test**: With JavaScript disabled, submit a valid supported full postcode from `/report`
and verify a redirect to the existing nearby/details step; nearby and review pages display the
canonical postcode and never display latitude or longitude.

### Tests for User Story 1

- [X] T011 [P] [US1] Replace coordinate-page assertions with postcode-flow contract coverage in `tests/server/contract/report-pages.test.ts`: `GET /report` exposes one `postcode` field and no coordinate fields; `POST /report/location` accepts normalized full postcodes and redirects only after resolution/routing.
- [X] T012 [P] [US1] Update location display assertions in `tests/server/unit/html-views.test.ts` so nearby and review view models render the selected canonical postcode rather than rounded coordinates.
- [X] T013 [P] [US1] Update the manual no-JavaScript journey in `tests/e2e/report-progressive-enhancement.spec.ts` to submit a supported full postcode and complete the existing report flow without browser geolocation.

### Implementation for User Story 1

- [X] T014 [US1] Replace coordinate validation with full-postcode form validation in `src/server/domain/report-page-forms.ts`; reject empty, malformed, area-only, and district-only values while accepting harmless casing and spacing differences.
- [X] T015 [US1] Add `PostcodeLocationService` dependency wiring in `src/server/app.ts` and `src/server/routes/report-pages.ts`, then replace `POST /report/location` coordinate parsing with postcode resolution, canonical-draft update, existing council routing, and existing nearby/details redirects.
- [X] T016 [US1] Replace latitude/longitude rendering with a labelled, required incident-postcode field in `src/server/views/templates/location.hbs`; retain submitted input and server-rendered error/retry guidance on failed submissions.
- [X] T017 [US1] Update location page data and resident-facing location display in `src/server/views/report-pages.ts`, `src/server/views/templates/nearby.hbs`, and `src/server/views/templates/review.hbs` so every displayed report location is the canonical selected postcode and no coordinate string is rendered.

**Checkpoint**: User Story 1 is independently complete when a resident can manually report using a full
postcode with JavaScript unavailable, while council routing, nearby checking, review, and submission
continue to receive the resolved location internally.

---

## Phase 4: User Story 2 - Start with a nearby postcode suggestion (Priority: P2)

**Goal**: When a resident permits browser location, prefill an untouched postcode field with the
closest canonical postcode without making browser location or JavaScript required.

**Independent Test**: Stub a permitted browser location and reverse-geocoding result, load `/report`,
and verify the empty postcode field receives the closest postcode within 10 seconds; type or edit a
value before the result and verify it is never overwritten.

### Tests for User Story 2

- [X] T018 [P] [US2] Add suggestion-endpoint contract cases in `tests/server/contract/report-pages.test.ts` for CSRF/session protection, `200 { "postcode": "…" }`, `204` no result, `503` provider failure, `Cache-Control: no-store`, and proof that the request does not mutate the report draft.
- [X] T019 [P] [US2] Add browser helper behavior coverage in `tests/e2e/report-progressive-enhancement.spec.ts` for permission-granted prefill, denied/unavailable geolocation fallback, and the no-overwrite rule for typed or edited values.

### Implementation for User Story 2

- [X] T020 [US2] Implement `POST /report/location/suggestion` in `src/server/routes/report-pages.ts` according to `contracts/report-location.md`: validate the draft and CSRF token, accept body-only latitude/longitude, call `PostcodeLocationService`, return only a canonical postcode or the specified empty/unavailable outcomes, and set `Cache-Control: no-store` without updating `ReportDraftSession`.
- [X] T021 [US2] Replace coordinate-filling behavior in `src/server/public/location-helper.js` with optional browser geolocation followed by a same-origin CSRF-protected JSON POST to `/report/location/suggestion`; fill only an empty, untouched `input[name="postcode"]` and silently preserve manual entry on every failure path.

**Checkpoint**: User Story 2 is independently complete when reverse geocoding pre-fills only a blank
postcode field after permission, while all denied, unavailable, or no-JavaScript cases remain manual
postcode entry flows.

---

## Phase 5: User Story 3 - Correct an unusable postcode (Priority: P3)

**Goal**: Keep residents on the location step with clear corrective or retry guidance when a postcode
is empty, partial, malformed, unlocatable, unsupported, or cannot currently be resolved.

**Independent Test**: Submit each unusable-postcode outcome and verify the same server-rendered page
retains the submitted value, explains the specific corrective/retry action, and makes no downstream
nearby-report or submission request.

### Tests for User Story 3

- [X] T022 [P] [US3] Add invalid-postcode contract cases in `tests/server/contract/report-pages.test.ts` covering empty, malformed, area-only, district-only, unlocatable, unsupported-council, and provider-unavailable submissions; assert retained form values, correct status/message, and no stage advancement.
- [X] T023 [P] [US3] Add location-page error-display cases in `tests/server/unit/html-views.test.ts` for validation, unlocatable/unsupported, and temporary-provider retry messages with retained postcode values.

### Implementation for User Story 3

- [X] T024 [US3] Map `PostcodeLocationService` validation, not-found, unavailable, and existing council-routing outcomes to distinct retained-value messages and statuses in `src/server/routes/report-pages.ts`, preserving the existing supported/unsupported council behavior.
- [X] T025 [US3] Update state-specific guidance and accessible alerts in `src/server/views/report-pages.ts` and `src/server/views/templates/location.hbs` so partial/invalid values ask for a full postcode, unlocatable/unsupported values request a different postcode, and temporary failures offer retry.

**Checkpoint**: User Story 3 is independently complete when every unusable-postcode outcome is
recoverable without data loss and neither latitude nor longitude appears in the recovery experience.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify that the completed feature retains privacy, progressive enhancement, build
integrity, and documentation/contract compliance.

- [X] T026 [P] Reconcile resident-facing labels, error wording, and postcode terminology across `src/server/views/templates/location.hbs`, `src/server/views/templates/nearby.hbs`, `src/server/views/templates/review.hbs`, and `specs/011-postcode-location-input/contracts/report-location.md`.
- [X] T027 [P] Extend privacy regression checks in `tests/server/contract/security.test.ts` and `tests/server/unit/logger.test.ts` to confirm postcodes and suggestion coordinates are absent from logs, URLs, and browser-storage-related responses.
- [X] T028 Run the validation sequence in `specs/011-postcode-location-input/quickstart.md` (`npm run lint`, `npm run format`, `npm run build`, `npm test`, and `npm run test:e2e`) and resolve feature-related failures in the affected source or test files.

---

## Dependencies & Execution Order

```text
Phase 1: Setup
  └── Phase 2: Foundational postcode boundary
        ├── Phase 3: US1 manual postcode reporting (MVP)
        ├── Phase 4: US2 optional current-location suggestion
        └── Phase 5: US3 invalid-postcode recovery
              └── Phase 6: Polish and full regression validation
```

- **US1** depends on the foundational adapter, service, draft, and redaction work.
- **US2** depends on the foundational adapter/service and the postcode field supplied by US1.
- **US3** depends on the foundational outcome model and builds on US1's form route/display surface.
- Once US1 completes, US2 and US3 can proceed in parallel if separate implementers coordinate only on
  the shared `report-pages.ts` and `location.hbs` changes; sequence those shared-file edits to avoid
  merge conflicts.

## Parallel Execution Examples

### Foundational phase

```text
Parallel after T003–T007 design interfaces are agreed:
- T008 adapter integration tests
- T009 postcode service/domain tests
- T010 draft lifecycle and logging-redaction tests
```

### User Story 1

```text
Parallel before implementation changes:
- T011 report-page contract tests
- T012 view unit tests
- T013 no-JavaScript E2E test
```

### User Story 2

```text
Parallel before endpoint/helper implementation:
- T018 suggestion endpoint contract tests
- T019 browser progressive-enhancement E2E tests
```

### User Story 3

```text
Parallel before recovery-path implementation:
- T022 invalid-outcome contract tests
- T023 error-display view tests
```

## Implementation Strategy

### MVP first (User Story 1)

1. Complete setup and the foundational postcode adapter/service/session/privacy work.
2. Implement and test US1 only.
3. Validate a full no-JavaScript report from postcode entry through review and submission.
4. Deploy or demonstrate this manual, accessible postcode flow before adding browser-location
   convenience behavior.

### Incremental delivery

1. Add US2 as optional progressive enhancement; failure must always leave the MVP manual flow intact.
2. Add US3's detailed recovery states and verify no data loss on correction/retry.
3. Run full privacy, contract, build, and end-to-end regression checks.
