# Implementation Plan: Check Nearby Reports

**Branch**: `002-nearby-report-check` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-nearby-report-check/spec.md`

## Summary

Extend the existing Jekyll frontend and single Node.js backend so that, after browser location is
obtained and before report details or submission are enabled, the resident sees all nearby reports
returned by Love Clean Streets. The resident explicitly decides whether any listed report matches.
A matching decision discards the transient draft and terminates the new-report flow; a no-match or
empty result permits the existing fly-tipping report workflow to continue.

The backend queries the nearby-report endpoint used by the supplied Love Clean Streets report page:
`/v2.svc/reports/nearby/{latitude},{longitude}?approvedonly=false&days=30`. It maps the external
response to safe resident-facing summaries and never persists or logs report-list data.

## Technical Context

**Language/Version**: Ruby 3.3 with Jekyll 4.x and browser-native JavaScript for the static frontend;
TypeScript 5.x and Node.js 24 LTS for the backend

**Primary Dependencies**: Existing Jekyll/Liquid frontend; existing Express, Zod, Axios, and
cookie-jar backend dependencies; no new runtime service or persistent store

**Storage**: N/A — nearby-report results and the resident's decision exist only in browser memory for
the active session; backend values are request-local

**Testing**: Existing Vitest/Supertest backend tests and Playwright browser-flow tests; add mock
nearby-report endpoint fixtures to the existing mock Love Clean Streets service

**Target Platform**: Existing Jekyll static-site hosting, Node.js 24 Linux backend, and modern
browsers with location permission

**Project Type**: Existing static web frontend plus one Node.js web-service backend

**Performance Goals**: The nearby-report list or a no-results state is shown within 10 seconds of a
valid location lookup under normal target-service conditions; the resident cannot advance while the
lookup is pending or unavailable

**Constraints**: Query the Love Clean Streets nearby-report endpoint with the detected location,
`approvedonly=false`, and `days=30`; display every returned report as a safe summary; do not expose
images, full external payloads, hidden metadata, or resident location in logs; do not persist the
list or decision; a matching decision makes no new-report submission request

**Scale/Scope**: One lookup per location acquisition or explicit retry; current-session results only;
no subscription, report-detail page, report modification, pagination, accounts, or additional
backend service

## Constitution Check

| Gate | Pre-design status | Post-design status | Evidence |
|---|---|---|---|
| No secrets in source or logs | Pass | Pass | The endpoint requires no resident credential; backend redaction is extended to nearby-report data and location. |
| Single deployable by default | Pass | Pass | The Jekyll site stays static and the existing Node.js backend performs the one additional outbound lookup. |
| New process/service has written justification | Pass | Pass | No process, service, queue, or datastore is added. |
| Material configuration/tooling change receives compliance review | Pass | Pass | Review must cover the external nearby-report endpoint, its 30-day query window, safe response mapping, and log redaction. |

## Project Structure

### Documentation (this feature)

```text
specs/002-nearby-report-check/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nearby-reports.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── report.md
└── assets/js/
    ├── report-flow.js
    ├── report-state.js
    └── nearby-reports.js

backend/
├── src/
│   ├── adapters/love-clean-streets/
│   │   └── nearby-reports.ts
│   ├── routes/
│   │   └── nearby-reports.ts
│   ├── services/
│   │   └── nearby-reports-service.ts
│   └── domain/
│       └── nearby-report.ts
└── tests/
    ├── contract/
    └── integration/

tests/e2e/
└── nearby-report-check.spec.ts
```

**Structure Decision**: Add a Jekyll-rendered nearby-report step and browser-native interaction module
to the existing frontend. Add one read-only endpoint and adapter to the existing Node.js backend. The
backend, rather than the browser, queries Love Clean Streets so external payloads can be validated,
reduced to safe summaries, protected by existing origin/rate/log controls, and hidden from the
frontend except for the resident-facing list.

## Complexity Tracking

No constitution violations require justification.
