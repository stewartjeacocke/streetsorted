---
description: 'Actionable implementation tasks for the Prototype Landing Page feature'
---

# Tasks: Prototype Landing Page

**Input**: Design documents from `/specs/008-prototype-landing-page/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/landing-page.md](contracts/landing-page.md), and
[quickstart.md](quickstart.md)

**Tests**: Focused automated tests are included because the implementation plan requires proof of
build-time HTML generation, private-template non-publication, and root-page delivery. Write these
tests before the associated asset-build and static-serving changes, and confirm they fail first.

**Organization**: Tasks are grouped by user story. The initial valid `index.hbs` source is created
in the foundation phase so the asset builder and development startup can be implemented without
referencing a missing template.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks after their listed prerequisites are complete.
- **[Story]**: User story traceability label (`US1`, `US2`, or `US3`).
- Every task includes an exact repository path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing asset pipeline remains the feature integration point; no new
project, dependency, service, or client build configuration is needed.

- [x] T001 Review `src/server/dev/static-assets.ts`, `src/server/dev-server.ts`, `src/server/views/templates/layout.hbs`, `src/server/public/report.css`, and the existing server tests before editing to preserve the established static-asset, layout, styling, and test conventions.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the valid private template source that later asset-build and static-serving work
will consume.

**⚠️ CRITICAL**: Complete this phase before implementing or validating generated root-page delivery.

- [x] T002 Create `src/server/views/templates/index.hbs` as a valid Handlebars page using the existing `layout` partial, with fixed placeholder-safe landing content sufficient for the build to render a complete document; keep the source private and do not create a public `index.html` source file.

**Checkpoint**: `index.hbs` exists as a valid private template, so following tasks can add failing tests and build-time rendering without a missing-source failure.

---

## Phase 3: User Story 1 - Understand the prototype and start reporting (Priority: P1) 🎯 MVP

**Goal**: Give first-time visitors a root page that identifies the Street Sorted prototype and moves
them into the existing report journey through a clearly distinguished standard link.

**Independent Test**: Run the app with generated static assets, open `/`, identify the purpose and
primary action, then activate it and confirm navigation to the existing `/report` first step without
JavaScript.

### Tests for User Story 1

- [x] T003 [P] [US1] Extend `tests/server/unit/html-views.test.ts` to verify `copyStaticAssets` renders `src/server/views/templates/index.hbs` with `layout.hbs` into final public `index.html`, includes shared layout markers and `/report.css`, and does not publish `index.hbs` or a Handlebars JavaScript artifact.
- [x] T004 [P] [US1] Add a root-page request contract in `tests/server/contract/report-pages.test.ts` that configures generated static assets, requests `GET /`, and verifies the prototype introduction, semantic shared document layout, and primary `/report` link.

### Implementation for User Story 1

- [x] T005 [US1] Extend `src/server/dev/static-assets.ts` to render the private `index.hbs` Handlebars template with `layout.hbs` and fixed public context, then write final HTML to `index.html` in the selected public asset destination; do not emit a Handlebars JavaScript artifact or copy `.hbs` sources into public assets.
- [x] T006 [US1] Update `src/server/dev-server.ts` to run the existing asset-build function before Express starts and to serve the generated public asset directory, so local `GET /` uses the same build-time HTML artifact as production.
- [x] T007 [US1] Refine `src/server/views/templates/index.hbs` with a landing-specific title, a plain-language Street Sorted fly-tipping prototype introduction, semantic heading structure, and one standard `href="/report"` action; do not add client-side routing, required scripts, forms, resident data, or a report-submission claim.
- [x] T008 [US1] Add a narrowly scoped primary-action style in `src/server/public/report.css` and apply its class to the `/report` anchor in `src/server/views/templates/index.hbs`, preserving the existing layout while ensuring the action's purpose remains clear from text and document order when styles are unavailable.

**Checkpoint**: The generated MVP root document introduces the prototype, presents an identifiable primary action, and links to `/report` using ordinary navigation.

---

## Phase 4: User Story 2 - Know what to expect before beginning (Priority: P2)

**Goal**: Tell prospective reporters what the journey does and which information they will provide.

**Independent Test**: From `/`, verify a visitor can identify the ordered location, nearby-report,
and detail stages and can name both a location and description as expected inputs before starting.

### Implementation for User Story 2

- [x] T009 [US2] Extend `src/server/views/templates/index.hbs` with a concise ordered explanation of providing an issue location, checking for a matching nearby report, and adding report details when needed.
- [x] T010 [US2] Add preparation guidance to `src/server/views/templates/index.hbs` stating that the journey requests an issue location and description, while clearly describing Street Sorted as a prototype rather than a live-service guarantee.

**Checkpoint**: The generated root page sets accurate journey expectations without changing report rules or collecting information itself.

---

## Phase 5: User Story 3 - Re-enter the reporting journey (Priority: P3)

**Goal**: Preserve a predictable, safe root-page action for returning visitors to begin again.

**Independent Test**: Visit `/` after beginning, cancelling, or completing a report; activate the
landing-page action and verify that it enters the existing `/report` starting behavior without
exposing prior draft data or relying on JavaScript.

### Implementation for User Story 3

- [x] T011 [US3] Verify and finalize the primary action in `src/server/views/templates/index.hbs` as a session-independent `href="/report"` anchor with restart-oriented wording that does not embed, display, or mutate a prior report draft.
- [x] T012 [US3] Confirm `src/server/dev/static-assets.ts` renders the landing document from fixed build context only, so the generated `index.html` contains no report-session identifier, CSRF value, resident input, credential, or report-submission status.

**Checkpoint**: Returning visitors can reliably use `/` to enter the established report start flow without landing-page state leakage.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Verify the generated artifact, root-page delivery, accessibility baseline, and existing
report journey without expanding scope.

- [x] T013 [P] Run `npm run build` and inspect `dist/server/public/index.html` against `specs/008-prototype-landing-page/contracts/landing-page.md`; confirm final HTML exists, uses the shared layout markers and `/report.css`, links to `/report`, and no public `index.hbs` or Handlebars JavaScript artifact is produced.
- [x] T014 [P] Run `npm test` and `npm run lint` from `package.json` to verify the focused landing-page tests, existing server behavior, and style checks remain green after the static-asset and development-startup changes.
- [x] T015 Run `npm run dev` and execute the manual browser scenarios in `specs/008-prototype-landing-page/quickstart.md`, including the JavaScript-disabled root-link-to-report flow, stylesheet-disabled readability, keyboard-only access to the primary action, and the returning-visitor restart flow.
- [x] T016 Run `npm run test:e2e` from `package.json` to confirm the existing progressive-enhancement report journey remains intact.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001; T002 creates the template source required by the user-story tests and implementation.
- **User Story 1 (Phase 3)**: Depends on T002. T003 and T004 are written first and should fail before T005–T008 make them pass.
- **User Story 2 (Phase 4)**: Depends on T007 because it extends the landing document introduced by US1.
- **User Story 3 (Phase 5)**: Depends on T007 because it finalizes the same primary action, but does not depend on US2's explanatory copy.
- **Polish (Phase 6)**: Depends on T003–T012. T013 and T014 can run in parallel; T015 and T016 occur after the built implementation is ready.

### User Story Dependencies

- **US1 (P1)**: Requires only the valid template source from Phase 2; it establishes generated static-root delivery and the primary report-start action.
- **US2 (P2)**: Builds on the `index.hbs` template created in Phase 2 and refined in US1; it does not change navigation behavior.
- **US3 (P3)**: Builds on the US1 primary anchor and independently verifies that the entry point remains state-free and restart-safe.

## Parallel Opportunities

- T003 and T004 can run in parallel after T002 because they modify different test files.
- T013 and T014 can run in parallel after implementation completion because they inspect/run different validation paths.
- T009 and T011 affect the same `index.hbs` file and **must not** be performed in parallel.
- T012 can be reviewed in parallel with T009 only after T005 is complete, but should be finalized after T011 so its inspection covers the final landing page.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T002 to create a valid private template source.
2. Complete T003–T008 to test and implement generated static-root delivery, prototype introduction, and the ordinary `/report` action.
3. Run T013–T015 for the MVP scope; confirm `/` serves generated HTML, the action is visibly distinguished with styles, and it remains understandable and functional without styles or JavaScript.
4. Demo or deploy the MVP if the validation results meet the contract.

### Incremental Delivery

1. Add US1 to deliver the root entry point and report-start action.
2. Add US2 to improve resident understanding before they begin.
3. Add US3 to finalize repeat-entry safety and state-free behavior.
4. Complete the cross-cutting validation tasks before release.
