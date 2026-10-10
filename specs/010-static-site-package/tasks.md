---

description: "Actionable implementation tasks for independently deployable static and server artifacts"
---

# Tasks: Independently Deployable Static Site Package

**Input**: Design documents from `specs/010-static-site-package/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/build-artifacts.md](contracts/build-artifacts.md), and
[quickstart.md](quickstart.md)

**Tests**: Tests are included because the specification requires independently testable release flows,
package-integrity checks, browser behavior with JavaScript disabled, and measurable release validation.

**Organization**: Tasks are grouped by user story so each release outcome can be implemented and verified
independently after shared artifact foundations are complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated dependencies are complete because it changes different files.
- **[Story]**: Maps a task to its user story: `US1`, `US2`, or `US3`.
- Every task includes its concrete target file path(s).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish documented, non-secret release inputs before adding static-package behavior.

- [X] T001 Document public `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION` build inputs in `.env.example`; label the server base URL as visitor-safe and prohibit credentials, API keys, and other server-only values.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared public-content and artifact-identity boundaries required by both independent
release artifacts.

**⚠️ CRITICAL**: Complete this phase before implementing either release flow.

- [X] T002 Expose a visitor-safe council-profile projection in `src/server/services/council-directory.ts`; preserve unique profile IDs, non-empty display names, public destination URLs, and `anonymousSubmissionAvailable` flags.
- [X] T003 Update `src/server/services/council-directory.ts` to retain server-only routing fields while exporting the visitor-safe projection used by the static builder.
- [X] T004 Create `src/shared/release-manifest.ts` to validate required non-empty `SOURCE_REVISION` input and write the public `{ artifactType, sourceRevision }` manifest used by both artifacts.
- [X] T005 [P] Add regression coverage for the visitor-safe council projection in `tests/server/unit/council-directory.test.ts`, including default profiles and exclusion of server-only fields.
- [X] T006 [P] Add manifest validation tests in `tests/server/unit/release-manifest.test.ts` for the `static-site` and `server` artifact types and missing `SOURCE_REVISION` failure.

**Checkpoint**: Shared public content and release identity are ready; user-story work can begin.

---

## Phase 3: User Story 1 - Publish static site separately (Priority: P1) 🎯 MVP

**Goal**: Produce a self-contained `dist/static-site/` package that can be published to a standard static
host without building, running, or packaging the Node.js server.

**Independent Test**: From a clean workspace with only `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION` set,
run `npm run build:static-site`, serve `dist/static-site/` with a static file server, and verify the landing
page plus all referenced assets load without starting the application server.

### Tests for User Story 1

- [X] T007 [P] [US1] Write failing public-build configuration tests in `tests/static-site/unit/config.test.ts` for an absolute HTTP(S) `PUBLIC_SERVER_BASE_URL` with **no credentials, query string, fragment, or trailing slash**, and for required non-empty `SOURCE_REVISION`.
- [X] T008 [P] [US1] Write failing static-package contract tests in `tests/static-site/contract/build-artifacts.test.ts` that build from a clean temporary directory and require `index.html`, every locally referenced asset, `AGENTS.md`, and `release.json`, while rejecting `.hbs` templates, server modules, `.env` files, server-only configuration, and credential-like output.
- [X] T009 [US1] Retain existing landing-template regression expectations in `tests/server/unit/html-views.test.ts` while adding standalone-package coverage in `tests/static-site/contract/build-artifacts.test.ts`.

### Implementation for User Story 1

- [X] T010 [US1] Create public-only build-input parsing and URL normalization in `src/static-site/config.ts`; expose only `PUBLIC_SERVER_BASE_URL`, public council data, and `SOURCE_REVISION`, and do not load `AUTHORITY_LOOKUP_API_KEY` or other server runtime configuration.
- [X] T011 [P] [US1] Render the existing landing and agent-guide sources through `src/static-site/build.ts`; render the report-start link as `${PUBLIC_SERVER_BASE_URL}/report`, retain council content and ordinary anchors, and render server endpoint guidance with the same public base URL.
- [X] T012 [P] [US1] Copy static-host public files from `src/server/public/` into `dist/static-site/` through `src/static-site/build.ts`, including the stylesheet and every asset referenced by the static landing page; exclude dynamic-report-only `location-helper.js` unless it becomes directly referenced by static HTML.
- [X] T013 [US1] Implement static artifact assembly and pre-publication integrity validation in `src/static-site/build.ts`; create `dist/static-site/`, copy only public files, render the final HTML and agent guide, write the `static-site` release manifest, validate local asset references and forbidden content, and delete or withhold invalid output on failure.
- [X] T014 [US1] Add the `build:static-site` command to `package.json` so it invokes `src/static-site/build.ts` without invoking TypeScript server compilation, starting Express, or requiring server credentials.
- [X] T015 [US1] Run and fix the new static-site tests in `tests/static-site/unit/config.test.ts`, `tests/static-site/contract/build-artifacts.test.ts`, and `tests/server/unit/html-views.test.ts` until the static-only release flow passes.

**Checkpoint**: `dist/static-site/` is a validated, independently publishable static artifact. This is the MVP.

---

## Phase 4: User Story 2 - Release server and static site independently (Priority: P2)

**Goal**: Create identifiable server and static artifacts independently, and ensure the production server
release does not package or require the static landing-site artifact.

**Independent Test**: In separate clean runs, execute `npm run build:server` and `npm run build:static-site`.
Confirm each output carries the proper `release.json` type and source revision, and that either output can be
deployed without producing the other.

### Tests for User Story 2

- [X] T016 [P] [US2] Write server-artifact isolation tests in `tests/server/contract/server-artifact.test.ts` that require `dist/server/release.json`, private runtime templates, and dynamic report assets while rejecting a static landing `index.html` and any dependency on `dist/static-site/`.
- [X] T017 [P] [US2] Update package-command contract assertions in `tests/server/contract/runtime-dependencies.test.ts` for `build:server`, `build:static-site`, aggregate `build`, and the removal of the old coupled `build:assets` contract.

### Implementation for User Story 2

- [X] T018 [US2] Implement server artifact assembly in `src/server/dev/server-assets.ts` to copy private runtime templates plus only dynamic report-page assets (`report.css` and `location-helper.js`) into `dist/server/` and write the `server` release manifest without creating `dist/static-site/`.
- [X] T019 [US2] Update `src/server/server.ts`, `src/server/dev-server.ts`, and `src/server/app.ts` so the dynamic server serves only its required report-page assets, does not require a static landing `index.html`, and preserves `/health`, `/report`, and `/api` behavior.
- [X] T020 [US2] Update `package.json` to make `build:server` assemble only `dist/server/`, make aggregate `build` invoke both independent build commands, and keep the two commands usable in separate clean workspaces.
- [X] T021 [US2] Update `Dockerfile` to execute `npm run build:server` and copy only `dist/server/` into the runtime image.
- [X] T022 [US2] Document separate creation, identification, and deployment of the `static-site` and `server` artifacts in `README.md`, including the `release.json` fields and the requirement to provide `SOURCE_REVISION`.
- [X] T023 [US2] Run and fix independent artifact tests in `tests/server/contract/server-artifact.test.ts` and `tests/server/contract/runtime-dependencies.test.ts`, then verify the Dockerfile server artifact does not contain `dist/static-site/`.

**Checkpoint**: The server and static-site release lifecycles are independently buildable, identifiable, and
deployable.

---

## Phase 5: User Story 3 - Preserve the public landing experience (Priority: P3)

**Goal**: Preserve the existing landing-page content, public council destinations, styling, and ordinary
navigation after moving it to static hosting, including a static host that differs from the server origin.

**Independent Test**: Serve `dist/static-site/` at one local origin and the report server at another. With
JavaScript both enabled and disabled, confirm the landing page content, stylesheet, council links, and the
absolute report-start link remain usable.

### Tests for User Story 3

- [X] T024 [P] [US3] Add static-host browser coverage in `tests/e2e/static-site-package.spec.ts` that serves `dist/static-site/` separately from the Node.js server and verifies the final report link targets `${PUBLIC_SERVER_BASE_URL}/report` with JavaScript enabled and disabled.
- [X] T025 [P] [US3] Extend static landing regression assertions in `tests/static-site/contract/build-artifacts.test.ts` for current headings, prototype notice, council support text, public council destination links, `report.css`, absence of required client JavaScript, and rendered agent-guide server URLs.

### Implementation and verification for User Story 3

- [X] T026 [US3] Refine static rendering in `src/static-site/build.ts` as required by the new regression tests; preserve all existing visitor-facing landing content and use only normal document links.
- [X] T027 [US3] Verify the copied `src/server/public/report.css` asset preserves landing presentation in `dist/static-site/` without introducing a JavaScript dependency or client-side routing.
- [X] T028 [US3] Run and fix `tests/e2e/static-site-package.spec.ts` and `tests/static-site/contract/build-artifacts.test.ts` until both cross-origin and JavaScript-disabled landing journeys pass.

**Checkpoint**: The separately hosted static landing experience matches the current public journey and reaches
the intended dynamic report server.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the whole release workflow, documentation, security posture, and project quality gates.

- [X] T029 [P] Reconcile release instructions and environment-variable descriptions across `README.md`, `.env.example`, and `specs/010-static-site-package/quickstart.md` so `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION` have one canonical meaning.
- [X] T030 [P] Review static artifact integrity checks in `src/static-site/build.ts` against Constitution Principle I and ensure diagnostics never echo secret values or write them to `dist/static-site/`.
- [X] T031 Run all required verification commands from `package.json` and the clean-workspace scenarios in `specs/010-static-site-package/quickstart.md`; correct failures in the referenced implementation or test files before release.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on T001; blocks all user-story implementation.
- **US1 (Phase 3)**: Depends on T002–T006. Delivers the MVP static package.
- **US2 (Phase 4)**: Depends on T002–T006 and the static artifact contract established by T007–T015.
- **US3 (Phase 5)**: Depends on completed US1 output; it can proceed in parallel with late US2 documentation and Docker work once `build:static-site` is stable.
- **Polish (Phase 6)**: Depends on all three user stories.

### User Story Dependencies

```text
Setup → Foundational → US1 (P1) → US2 (P2)
                         └──────→ US3 (P3)
US2 + US3 → Polish
```

- **US1** has no user-story dependency after the shared foundation and can be released as the MVP.
- **US2** consumes the static artifact interface from US1 to prove independent lifecycle behavior.
- **US3** consumes US1's package and may run alongside US2 after the static build command is stable.

### Parallel Opportunities

- T005 and T006 can run in parallel after T002–T004.
- T007 and T008 can be authored in parallel; T011 and T012 can be implemented in parallel after T010.
- T016 and T017 can be authored in parallel.
- T024 and T025 can be authored in parallel.
- T029 and T030 can run in parallel during polish.

## Parallel Example: User Story 1

```text
# After T002–T006, write independent test files in parallel:
Task: "T007: Public static-build configuration tests in tests/static-site/unit/config.test.ts"
Task: "T008: Static-package contract tests in tests/static-site/contract/build-artifacts.test.ts"

# After T010, implement independent static inputs in parallel:
Task: "T011: Landing and agent-guide templates in src/static-site/templates/"
Task: "T012: Static public assets in src/static-site/public/"
```

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete T001–T006 to establish public content and release-manifest primitives.
2. Complete T007–T015 to create and validate `dist/static-site/` without the Node.js server.
3. Stop and run the US1 independent test. Publish the static package to a test static host if it passes.

### Incremental Delivery

1. Deliver US1: a valid, static-hostable landing package.
2. Deliver US2: isolate the server artifact, release manifest, Docker image, and operator documentation.
3. Deliver US3: prove visual/content continuity and cross-origin, no-JavaScript navigation.
4. Complete polish and execute the quickstart release rehearsal.

---

## Phase 7: Convergence

- [X] T032 Isolate public static-site configuration and council-profile parsing from `src/server/config.ts` and `src/server/services/council-directory.ts` in `src/static-site/config.ts` and `src/static-site/build.ts`, so `build:static-site` never loads server-only configuration per plan: public-only static-build boundary (partial).
- [X] T033 Parse generated `dist/static-site/index.html` in `src/static-site/build.ts` and fail package creation when any locally referenced asset is absent, with corresponding coverage in `tests/static-site/contract/build-artifacts.test.ts` per FR-008 (partial).
- [X] T034 Expand independent static-host and Node-server deployment procedures in `README.md`, including artifact selection, `PUBLIC_SERVER_BASE_URL`, `SOURCE_REVISION`, and `release.json` verification, per FR-009 (partial).
- [X] T035 Remove or refactor the obsolete coupled landing-page builder in `src/server/dev/static-assets.ts` and migrate its assertions in `tests/server/unit/html-views.test.ts` and `tests/server/contract/report-pages.test.ts` to the independent artifact builders per plan: independent output architecture (unrequested).

---

## Phase 8: Convergence

- [X] T036 Factor the default public council profile fields into one shared source consumed by `src/static-site/councils.ts` and `src/server/services/council-directory.ts`, retaining server-only routing fields outside the public projection per plan: shared public council profile data (partial).
- [ ] T037 Run `podman build --build-arg SOURCE_REVISION=<revision>` and a container `/health` check in a namespace-enabled or rootful Podman environment; record the successful release-artifact validation in `README.md` per plan: Docker/server-artifact validation (partial).
