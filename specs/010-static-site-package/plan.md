# Implementation Plan: Independently Deployable Static Site Package

**Branch**: `010-static-site-package` | **Date**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-static-site-package/spec.md`

## Summary

Separate the current generated landing page from the Node.js server release by producing two independently
identifiable outputs: `dist/static-site/` for ordinary static hosting and `dist/server/` for the dynamic
report application. Add a public build-time `PUBLIC_SERVER_BASE_URL` so the final static HTML points its
report-start and agent-guide server links at the dynamically deployed server—even when it has another
origin. The static builder accepts only public content inputs, validates its output before success, and
never packages server sources, templates, or credentials.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting Node.js 26.

**Primary Dependencies**: Express 5, Handlebars 4, Zod 3; Node filesystem APIs for artifact assembly;
Playwright and Node's built-in test runner for validation.

**Storage**: N/A. The feature produces versioned filesystem artifacts; it introduces no database or
persistent application state.

**Testing**: `tsx --test` server unit and contract suites; Playwright end-to-end progressive-enhancement
coverage; artifact-integrity checks in static-package tests.

**Target Platform**: Linux/containerized Node.js server for dynamic reporting; any standard static HTTP host
for `dist/static-site/`.

**Project Type**: Single Node.js web-service repository with a separate static deployable artifact.

**Performance Goals**: No new runtime performance target. Static package creation must complete all
integrity checks before it is available for publication.

**Constraints**: The static artifact contains only public files; the public server base URL is absolute,
credential-free, and rendered into HTML at build time; essential navigation works with JavaScript disabled;
no SPA, client-side router, new runtime process, or queue is introduced.

**Scale/Scope**: One existing public landing page plus its referenced static assets and council directory;
one existing dynamic report server. The output scope is `dist/static-site/` and `dist/server/` from the same
source revision.

## Constitution Check

### Pre-design gate

| Principle | Assessment | Evidence / required design response |
|---|---|---|
| I. Secret Protection | PASS | Static-site inputs are restricted to public URL and council fields; validation rejects server sources, templates, private configuration, and credential-like output. |
| II. Single Deployable by Default | PASS | The static site is a separately publishable directory, not a new runtime service. The Node.js application remains a single dynamic server deployable. Its independent ownership and release cadence are documented in the specification. |
| III. Progressive Enhancement, Not SPAs | PASS | The static `index.html` contains an ordinary absolute report link. No JavaScript, client-side configuration fetch, or client-side routing is required for essential content or navigation. |
| Development Workflow | PASS | Build-script and Dockerfile changes receive tests, release documentation, and a post-design constitution review. |

No constitution violation requires complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-static-site-package/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── build-artifacts.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── app.ts                         # Dynamic routes and dynamic-page asset mounting
│   ├── config.ts                      # Server-only runtime configuration
│   ├── dev-server.ts                  # Local development orchestration
│   ├── server.ts                      # Dynamic server startup
│   ├── public/
│   │   ├── location-helper.js          # Dynamic-page optional enhancement
│   │   └── report.css                  # Shared style source copied to both artifacts
│   ├── views/templates/               # Private Handlebars runtime templates
│   └── [existing routes, services, adapters, and middleware]
├── static-site/
│   ├── build.ts                        # Public-only static package assembly and validation
│   ├── config.ts                       # Public build-input parsing and URL validation
│   ├── content.ts                      # Shared public council/landing content projection
│   ├── templates/                      # Static landing and rendered agent-guide sources
│   └── public/                         # Static-only public assets
└── shared/
    └── council-profiles.ts             # Public council profile data consumed by both artifacts

tests/
├── static-site/
│   ├── unit/                           # Public-config, render, and integrity validation
│   └── contract/                       # Command/output layout and artifact identity checks
├── server/
│   ├── contract/                       # Existing server behavior and package command coverage
│   └── unit/                           # Existing renderer and domain coverage
└── e2e/
    └── report-progressive-enhancement.spec.ts

package.json                            # Independent and aggregate artifact commands
Dockerfile                              # Builds and copies server artifact only
README.md                               # Independent build and deployment instructions
.env.example                            # Documents public static build configuration without secrets
```

**Structure Decision**: Retain one repository and one dynamic Node.js application. Factor the landing-page
build into a public-only `src/static-site/` module and factor public council data into a shared module,
rather than creating a second application or importing the full server configuration during static builds.
The exact extraction should preserve existing server behavior while ensuring each artifact can be built alone.

## Design Plan

### Phase 0: Research decisions

Research is complete in [research.md](research.md). It resolves the artifact boundary, cross-origin
navigation, public-only configuration boundary, release identity, and integrity-validation strategy. There
are no unresolved technical-context clarifications.

### Phase 1: Data and release-interface design

- [data-model.md](data-model.md) defines public static-build inputs, the public council profile projection,
  and the release-manifest lifecycle.
- [contracts/build-artifacts.md](contracts/build-artifacts.md) defines build commands, directory layouts,
  failure behavior, and release-manifest format. These commands are the feature's release-facing interface;
  no HTTP API contract changes are required.
- [quickstart.md](quickstart.md) defines clean-workspace validation for static-only and server-only releases,
  cross-origin landing links, JavaScript-disabled navigation, and package-integrity failure cases.

### Implementation approach

1. **Create independent output roots and commands.** Replace the current one-way `build:assets` dependency
   with `build:server` and `build:static-site`; retain `build` only as a convenience command that invokes
   both. The Dockerfile invokes only the server build and copies only `dist/server/` to the runtime image.
2. **Move static assembly behind a public-only boundary.** The static builder renders `index.html` and the
   static-host agent guide using the public server URL and public council fields. It copies every locally
   referenced landing asset to `dist/static-site/`, but never copies Handlebars sources, compiled server
   modules, `.env` files, or runtime-only configuration.
3. **Keep dynamic report assets with the server.** The server build retains the private Handlebars templates
   and assets needed by `/report` pages (`report.css` and optional `location-helper.js`) without serving the
   static landing entry document. Shared style sources may be copied to both outputs.
4. **Render cross-origin navigation at build time.** The landing page's `/report` anchor becomes
   `${PUBLIC_SERVER_BASE_URL}/report` in final HTML. `AGENTS.md` is rendered with the same public server
   base URL so its documented server endpoints remain correct from the static host. No browser configuration
   request is used.
5. **Write deterministic artifact identity and validate before publication.** Both output roots receive a
   `release.json` manifest with artifact type and source revision. The static builder checks its entry
   document, local asset references, base URL, manifest, forbidden private files, and credential-like
   content; a failure exits non-zero and removes or withholds the invalid output.
6. **Update tests and release documentation.** Add isolated artifact tests and adapt existing static-page
   tests. Preserve server and report-page tests. Document separate build, identity, and deployment paths.

### Post-design constitution re-check

| Principle | Result | Post-design evidence |
|---|---|---|
| I. Secret Protection | PASS | Public-only static configuration plus output scanning prevent static-package inclusion of secrets or server-only settings. |
| II. Single Deployable by Default | PASS | The design adds a static release artifact only. There is no additional process, service, queue, or distributed runtime. |
| III. Progressive Enhancement, Not SPAs | PASS | Build-time HTML rendering creates a standard anchor to the dynamic server; JavaScript remains optional and there is no SPA routing. |
| Development Workflow | PASS | The quickstart requires clean-build, static-only, server-only, integrity, and no-JavaScript release validation. |

## Complexity Tracking

No constitution violations or justified complexity exceptions.
