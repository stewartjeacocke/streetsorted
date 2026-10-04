# Implementation Plan: Refactor Client for Progressive Enhancement

**Branch**: `006-refactor-progressive-enhancement` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-refactor-progressive-enhancement/spec.md`

## Summary

Replace the current reporting SPA with framework-free, server-rendered HTML and standard form
submissions. Remove all React runtime, type, test, JSX, and client-build dependencies; do not emit a
reporting-page SPA bundle. Keep the existing application as one Express deployable, retain the
existing JSON API contracts, and introduce a five-minute server-side draft session for the browser
flow. The only permitted client-side script is an optional location helper that fills the visible
manual location form; all reporting actions and navigation work without it.

## Technical Context

**Language/Version**: TypeScript targeting ES2024; Node.js 26

**Primary Dependencies**: Express 5, Zod validation, Helmet, CORS; no rendering framework or
client framework dependency

**Storage**: In-memory, short-lived server-side report-draft session store; no persistent database or
browser storage

**Testing**: Node test runner with tsx for server/domain/view tests and Playwright end-to-end tests

**Target Platform**: Same-origin browser-facing Express application on Node.js 26

**Project Type**: Single web application and API service

**Performance Goals**: Preserve the specified five-minute normal reporting journey; add no
reporting-page SPA bundle or client-rendering dependency; perform nearby lookup and submission only
when the resident requests the corresponding form action

**Constraints**: Server-rendered semantic HTML and standard forms for every report step; ordinary
document navigation; no SPA/client-side routing; no React, React DOM, React type, React test, JSX, or
client-bundling dependency; report drafts expire after five minutes of inactivity; location and
description never enter URLs, browser storage, or client-visible logs; only optional browser
geolocation JavaScript is permitted

**Scale/Scope**: One existing report journey (location, nearby duplicate check, details, review, and
outcome) within the current single Node.js deployable; preserve existing `/api` behavior

## Constitution Check

**Pre-design gate: PASS**

- **Secret Protection**: The design keeps report drafts server-side, avoids URLs/browser storage, uses
  opaque cookies and CSRF tokens, and relies on existing redacted request logging. Tests must confirm
  no new report data is logged or persisted client-side.
- **Single Deployable by Default**: The session store, page routes, rendering, optional geolocation
  asset, and static styling remain in the current Express application. No process, service, queue, or
  shared store is added.
- **Progressive Enhancement, Not SPAs**: All report steps are framework-free server-rendered HTML
  with standard forms and document navigation. The sole script is optional location form filling; it
  performs no routing, page rendering, report lookup, or submission.
- **Development Workflow**: Unit, integration, and JavaScript-disabled end-to-end coverage will prove
  the baseline flow and recovery paths.

**Post-design gate: PASS** — The design artifacts retain the same single-deployable, protected-session,
framework-free server-rendered approach and remove all React dependencies. No constitutional exception
or complexity justification is required.

## Project Structure

### Documentation (this feature)

```text
specs/006-refactor-progressive-enhancement/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── report-pages.md
└── tasks.md              # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── app.ts
│   ├── routes/           # Existing JSON routes plus report-page form routes
│   ├── services/         # Existing upstream services plus draft-session lifecycle
│   ├── domain/           # Report and draft-state validation
│   ├── views/            # Framework-free HTML layout, escaping, and report-page view functions
│   ├── public/           # CSS and the optional location-only helper script copied as static assets
│   └── middleware/       # Existing security/logging plus session/CSRF support
└── client/               # Removed with the legacy SPA, React tests, client build, and client tsconfig

tests/
├── server/
│   ├── contract/         # Existing JSON API contract tests and new page-form contracts
│   ├── integration/      # Session, rendering, and upstream-flow integration tests
│   └── unit/             # Draft lifecycle, validation, and CSRF tests
└── e2e/                  # JavaScript-disabled and optional-geolocation browser journeys
```

**Structure Decision**: Evolve the existing single Express project in place. Browser-facing report
views use framework-free TypeScript functions with centralized HTML escaping; session lifecycle and
static assets belong under `src/server`. Retire the existing client SPA, React dependencies, React
types/test tooling, client build script, and client TypeScript configuration. Existing server
integrations and JSON API routes remain their current responsibility boundaries.

## Complexity Tracking

No constitution violations require justification.
