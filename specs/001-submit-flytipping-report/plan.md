# Implementation Plan: Submit Fly-tipping Report

**Branch**: `001-submit-flytipping-report` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-submit-flytipping-report/spec.md`

## Summary

Deliver one static frontend site and one Node.js backend service that let an Islington resident
anonymously submit a fly-tipping report through Love Clean Streets. The frontend obtains browser
location with permission, fixes the category to fly-tipping, collects a description, and presents a
final review. After explicit confirmation it calls the backend, whose Love Clean Streets adapter
performs the anonymous-session and form-submission workflow. Neither tier persists report content,
target cookies, or credentials after the browser session/request ends.

## Technical Context

**Language/Version**: Ruby 3.3 with Jekyll 4.x for the static frontend; TypeScript 5.x and Node.js
24 LTS for the backend

**Primary Dependencies**: Jekyll and Liquid templates for the static frontend; browser-native
JavaScript for the reporting interaction; Express and Zod for the Node.js backend; an HTTP client
with a per-request cookie jar and HTML parser for the Love Clean Streets form adapter

**Storage**: N/A — report data is held in browser memory until submission and request-local backend
memory while submitting; no database, files, queues, or persistent session store

**Testing**: Jekyll build validation for the frontend; Supertest for backend-contract tests;
Playwright browser-flow tests against the built Jekyll site and a mock target service

**Target Platform**: Modern browsers that expose browser location permission; static-site hosting
for the Jekyll frontend; Node.js Linux container for the backend

**Project Type**: Static web frontend plus one Node.js web-service backend

**Performance Goals**: A resident can reach review within 3 minutes; local validation feedback is
visible within 1 second under normal network conditions; target-service submission outcome is shown
within 15 seconds or marked unconfirmed

**Constraints**: Anonymous reporting only; fly-tipping is the sole category; no photo attachments;
browser location is mandatory and cannot be manually edited; no credentials; no persistent storage;
the standard fly-tipping category ID is hard-coded as `16144`; report descriptions and precise
coordinates MUST NOT be logged; production submission depends on the target form remaining compatible
and on authorized use of the target service

**Scale/Scope**: One resident report per browser session; one static frontend site and one backend
instance are the initial deployment; external submissions are serialized per request; no user
accounts, history, drafts, tracking, or non-fly-tipping issue types

## Constitution Check

| Gate | Pre-design status | Post-design status | Evidence |
|---|---|---|---|
| No secrets in source or logs | Pass | Pass | The design uses no resident credentials and prohibits logging report content, coordinates, cookies, and target form tokens. |
| Single deployable by default | Pass with documented split | Pass with documented split | The browser frontend is static hosting, not a second runtime service. One Node.js backend performs all target integration; no queue, database, or second backend service is introduced. |
| New process/service has written justification | Pass | Pass | The backend is the sole runtime service. The separately deployed static site has organizational independence: its public UI can be released independently while the backend owns the restricted target-session boundary. |
| Material configuration/tooling change receives compliance review | Pass | Pass | The implementation requires review of frontend origin allowlisting, backend environment configuration, outbound target hostname, cookie handling, and log redaction before release. |

## Project Structure

### Documentation (this feature)

```text
specs/001-submit-flytipping-report/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── report-submission.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── Gemfile
├── _config.yml
├── _layouts/
│   └── default.html
├── assets/
│   ├── css/
│   └── js/
│       └── report-flow.js
├── index.md
└── report.md

backend/
├── package.json
├── src/
│   ├── adapters/love-clean-streets/
│   ├── routes/
│   ├── middleware/
│   └── app.ts
└── tests/
    ├── unit/
    ├── contract/
    └── integration/

tests/
└── e2e/
```

**Structure Decision**: Use a Jekyll static site under `frontend/` and one Node.js backend under
`backend/`. Jekyll renders the public page structure and assets at build time; a small browser-native
JavaScript module owns the temporary draft and location-permission interaction. The backend validates
the final payload and encapsulates the target site's anonymous-session, anti-forgery-token,
category-discovery, and form-submission behavior. The backend permits requests only from the deployed
Jekyll site's origin and never exposes target cookies to the browser. The static site is intentionally
not a runtime service; the Node.js backend is the only backend process.

## Complexity Tracking

| Violation / deviation | Why needed | Simpler alternative rejected because |
|---|---|---|
| Static site deployed separately from the backend | The user explicitly requires one frontend site and one backend service. The split isolates target-site session handling from the public UI and lets frontend releases remain independent. | Serving built frontend assets from the Node.js backend would reduce deployments, but conflicts with the required separate frontend site. |
