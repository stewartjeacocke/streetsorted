---
description: 'Actionable implementation tasks for the Handlebars report-view refactor'
---

# Tasks: Refactor Report Views to Handlebars Templates

**Input**: Design documents from `/specs/007-refactor-handlebars-templates/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/report-pages.md](contracts/report-pages.md),
[quickstart.md](quickstart.md)

**Tests**: Required. The specification explicitly requires automated coverage for all existing report flows,
JavaScript-disabled reporting, and safe rendering of dynamic values.

**Organization**: Tasks are grouped by user story. Complete the foundational renderer before changing any
route-facing page adapters; then deliver and validate each story in priority order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in its phase because it changes different files and has no
  incomplete-task dependency.
- **[US#]**: Maps the task to the matching user story in [spec.md](spec.md).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the server-side template dependency and establish the private template asset directory.

- [x] T001 Add `handlebars` at version `^4.7.9` to `package.json` and update `package-lock.json`.
- [x] T002 [P] Create the private template directory and shared partials in `src/server/views/templates/layout.hbs` and `src/server/views/templates/errors.hbs`; the layout must own the existing doctype, `lang="en-GB"`, metadata, `{{title}} | Street Sorted`, `/report.css`, main wrapper, product heading, and conditional deferred `/location-helper.js` script.
- [x] T003 [P] Extend `src/server/dev/static-assets.ts` so `npm run build` copies `src/server/views/templates` to `dist/server/views/templates` while continuing to copy only `src/server/public` to `dist/server/public`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build and verify the cached renderer used by every report page.

**⚠️ CRITICAL**: Complete this phase before converting a page function or deleting string-concatenation helpers.

- [x] T004 Add failing renderer/layout assertions in `tests/server/unit/html-views.test.ts` for a semantic document, shared Street Sorted shell, conditional location helper, escaped dynamic interpolation, and absence of a SPA root or client route script.
- [x] T005 Implement the cached synchronous Handlebars loader and renderer in `src/server/views/renderer.ts`; resolve templates module-relatively, read and compile only the known templates at process initialization, register the layout/error partials, and expose a fixed-name render API with no raw/unescaped dynamic-value helper.
- [x] T006 Update `tests/server/unit/html-views.test.ts` to pass against `src/server/views/renderer.ts` and confirm missing/invalid template assets fail during renderer initialization rather than on a resident request.

**Checkpoint**: Shared layout and cached rendering are ready; all page adapters can now render private templates.

---

## Phase 3: User Story 1 - Complete a Report Using Templated Pages (Priority: P1) 🎯 MVP

**Goal**: Preserve the standard resident report journey from location entry through confirmed submission
using Handlebars-rendered pages and ordinary form navigation.

**Independent Test**: With JavaScript disabled, complete a valid manual report and verify the same location,
no-nearby-result, details, review, and submission-outcome controls and content remain available.

### Tests for User Story 1

- [x] T007 [P] [US1] Add success-path template and HTML/form assertions in `tests/server/unit/html-views.test.ts` for location, details, review, and outcome view models, including `csrf` fields, retained values, five-decimal location display, and the description constraint "retains the existing 1,000-character form limit."
- [x] T008 [P] [US1] Extend the successful reporting contract assertions in `tests/server/contract/report-pages.test.ts` to verify unchanged location, details, review, submit, edit, and cancel actions plus hidden `confirmed=yes` where required.
- [x] T009 [P] [US1] Strengthen the standard JavaScript-disabled report journey in `tests/e2e/report-progressive-enhancement.spec.ts` to verify the shared document shell and successful submission outcome without an SPA root.

### Implementation for User Story 1

- [x] T010 [US1] Create `src/server/views/templates/location.hbs`, `src/server/views/templates/details.hbs`, `src/server/views/templates/review.hbs`, and `src/server/views/templates/outcome.hbs` using the layout partial block; preserve all headings, wording, form actions, names, labels, hidden values, buttons, and optional reference/retry behavior specified in `contracts/report-pages.md`.
- [x] T011 [US1] Refactor `src/server/views/report-pages.ts` so `locationPage`, `detailsPage`, `reviewPage`, and `outcomePage` map existing drafts/arguments to explicit view models and render the corresponding templates; preserve coordinate formatting, safe correction values, and retry rendering only when both retry eligibility and CSRF token are present.
- [x] T012 [US1] Remove superseded string-concatenation rendering helpers from `src/server/views/html.ts`, update its imports/callers, and delete `src/server/views/html.ts` if it has no remaining responsibility.

**Checkpoint**: A resident can complete the normal reporting flow with server-rendered Handlebars pages and no required JavaScript.

---

## Phase 4: User Story 2 - Understand Exceptional Report States (Priority: P2)

**Goal**: Preserve understandable nearby-result, validation, recovery, duplicate-match, cancellation, and
retry states in the templated report flow.

**Independent Test**: Trigger invalid input, each nearby-result state, out-of-order recovery, duplicate-match
exit, and an eligible submission retry; verify the message, status, retained safe values, and next action.

### Tests for User Story 2

- [x] T013 [P] [US2] Add nearby-state and recovery rendering cases in `tests/server/unit/html-views.test.ts`, covering `reports-found`, `no-results`, and `unavailable` states; verify nullable nearby fields are omitted and remaining summary values retain category, recorded time, location, status, description order.
- [x] T014 [P] [US2] Extend exceptional-flow coverage in `tests/server/contract/report-pages.test.ts` for validation value retention, nearby decision/retry forms, expired/invalid-CSRF recovery statuses, duplicate-match outcome, cancellation, and retry form `confirmed=yes` behavior.
- [x] T015 [P] [US2] Extend JavaScript-disabled exceptional-flow checks in `tests/e2e/report-progressive-enhancement.spec.ts` for duplicate-match exit, validation/recovery, nearby unavailability/retry, and unconfirmed-submission retry.

### Implementation for User Story 2

- [x] T016 [US2] Create `src/server/views/templates/nearby.hbs` and `src/server/views/templates/recovery.hbs`; implement all three nearby states and recovery alert/link markup exactly as specified in `contracts/report-pages.md`.
- [x] T017 [US2] Refactor `nearbyPage` and `recovery` in `src/server/views/report-pages.ts` to build the documented nearby/recovery view models, expose ordered non-empty nearby summary values, preserve all decision/retry/cancel forms, and render templates without moving route/session/CSRF decisions out of `src/server/routes/report-pages.ts`.

**Checkpoint**: All report exception states remain understandable and actionable with JavaScript disabled.

---

## Phase 5: User Story 3 - Maintain Safe and Consistent Presentation (Priority: P3)

**Goal**: Ensure every templated report response uses one shared document shell and safely displays all
resident- and upstream-provided dynamic content.

**Independent Test**: Render every page template with markup-like location values, descriptions, errors,
nearby fields, submission messages, and references; confirm the text is escaped and the document shell is
consistent.

### Tests for User Story 3

- [x] T018 [US3] Add hostile dynamic-content test cases in `tests/server/unit/html-views.test.ts` for markup-like field values, errors, nearby-report data, outcome messages, and references; assert literal escaped output and no new executable or structural markup.
- [x] T019 [US3] Add HTML-contract assertions in `tests/server/contract/report-pages.test.ts` that every report response retains the shared document shell and that the location helper is included only for `/report`.

### Implementation for User Story 3

- [x] T020 [US3] Review and tighten `src/server/views/templates/*.hbs` and `src/server/views/report-pages.ts` so dynamic values use only normal Handlebars interpolation, no triple-stash/raw output is present, and every page invokes the shared layout partial block.

**Checkpoint**: All report pages share one document presentation and safely render untrusted dynamic text.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate source, production artifact, and end-to-end behavior; leave the refactor ready for review.

- [x] T021 [P] Add a production-asset assertion in `tests/server/unit/html-views.test.ts` or a focused new test at `tests/server/unit/static-assets.test.ts` proving template files are copied into `dist/server/views/templates` and are not copied into `dist/server/public`.
- [x] T022 Run the full validation sequence from `specs/007-refactor-handlebars-templates/quickstart.md`: `npm run format`, `npm run lint`, `npm run test:server`, `npm run test:e2e`, and `npm run build`; resolve failures in the referenced source/test files.
- [x] T023 Review `specs/007-refactor-handlebars-templates/contracts/report-pages.md` against the final templates and `src/server/routes/report-pages.ts`; update the contract only if an intentionally approved public HTML/form behavior differs.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: T001–T003 can start immediately; T002 and T003 may run in parallel after T001's dependency decision is accepted.
- **Phase 2**: T004–T006 depend on Phase 1. T005 depends on T001–T003; T006 depends on T005.
- **US1 (Phase 3)**: T007–T009 can be prepared after Phase 2; T010 depends on T002/T005; T011 depends on T010; T012 depends on T011.
- **US2 (Phase 4)**: T013–T015 can be prepared after Phase 2; T016 depends on T002/T005; T017 depends on T016 and the renderer integration from T011.
- **US3 (Phase 5)**: T018–T019 follow the converted pages; T020 depends on T011 and T017.
- **Polish (Phase 6)**: T021–T023 depend on all story implementation tasks; T022 is the final validation gate.

### User Story Dependencies

- **US1 (P1)** is the MVP and requires only the shared renderer foundation.
- **US2 (P2)** reuses US1's route-facing adapter approach in `src/server/views/report-pages.ts`; complete it after US1 to avoid concurrent edits to that file.
- **US3 (P3)** verifies the shared behavior introduced in US1 and US2; complete it after both.

### Parallel Opportunities

- Phase 1: T002 and T003 can proceed in parallel after T001.
- US1 test preparation: T007, T008, and T009 affect distinct test files and can proceed in parallel.
- US2 test preparation: T013, T014, and T015 affect distinct test files and can proceed in parallel.
- T021 can be developed in parallel with contract review T023 after story implementation is complete.

---

## Parallel Example: User Story 1

```text
Task: "T007 Add success-path template assertions in tests/server/unit/html-views.test.ts"
Task: "T008 Extend successful-flow contract assertions in tests/server/contract/report-pages.test.ts"
Task: "T009 Strengthen JavaScript-disabled journey checks in tests/e2e/report-progressive-enhancement.spec.ts"
```

After those test tasks, complete T010 → T011 → T012 sequentially because they share template/rendering
interfaces and the route-facing view module.

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete T001–T006 to establish cached server-side template rendering.
2. Complete T007–T012 to move the normal reporting path to templates.
3. Run the US1 unit, contract, and JavaScript-disabled browser tests before proceeding.

### Incremental Delivery

1. Deliver the normal reporting path (US1).
2. Add all exceptional/report-recovery states (US2) without changing routes or server workflow rules.
3. Confirm comprehensive shared-shell and escaping guarantees (US3).
4. Complete production-asset and full-suite validation (T021–T023).
