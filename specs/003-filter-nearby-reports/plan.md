# Implementation Plan: Filter Nearby Reports

**Branch**: `003-filter-nearby-reports` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-filter-nearby-reports/spec.md`

## Summary

Apply the nearby-report relevance filter entirely in the existing Node.js backend before any result
is returned to the Jekyll frontend. The backend will retain only reports whose target category ID is
the existing fly-tipping ID (`16144`) and whose target completion state establishes that the report
remains open. It will exclude completed reports, non-fly-tipping reports, and records that lack the
required category or completion fields. The existing frontend requires no new filtering logic: an
empty post-filter result continues through its existing no-results path.

## Technical Context

**Language/Version**: TypeScript 5.x and Node.js 24 LTS for the backend; existing Ruby 3.3/Jekyll
frontend remains unchanged

**Primary Dependencies**: Existing Express, Zod, Axios, and Vitest/Supertest dependencies; no new
runtime dependency

**Storage**: N/A — raw and filtered nearby-report values remain request-local only

**Testing**: Existing adapter integration and route contract suites; existing Playwright regression
suite verifies that an empty backend result uses the existing no-results frontend path

**Target Platform**: Existing Node.js 24 Linux backend and static Jekyll frontend

**Project Type**: Existing static frontend plus one Node.js backend service; backend-only change

**Performance Goals**: Filtering completes within the existing nearby lookup response window and
returns the complete relevant set without pagination or an additional external lookup

**Constraints**: Filter before the API response; include only `CategoryId=16144`; exclude records
where `Completed` is not explicitly false or where `CategoryId` is unavailable or does not equal
`16144`; do not log raw, filtered-out, or returned report data

**Scale/Scope**: One in-memory list per nearby lookup; no frontend-state change, persistence, cache,
queue, external write, or additional service

## Constitution Check

| Gate | Pre-design status | Post-design status | Evidence |
|---|---|---|---|
| No secrets in source or logs | Pass | Pass | Existing redaction remains in force and tests cover raw/filtered report fields. |
| Single deployable by default | Pass | Pass | The change is contained in the current Node.js backend. |
| New process/service has written justification | Pass | Pass | No process, service, queue, or datastore is added. |
| Material configuration/tooling change receives compliance review | Pass | Pass | Review verifies category/completion predicates and that filtering occurs before API serialization. |

## Project Structure

### Documentation (this feature)

```text
specs/003-filter-nearby-reports/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nearby-report-filter.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── adapters/love-clean-streets/nearby-reports.ts
│   └── domain/nearby-report.ts
└── tests/
    ├── contract/nearby-reports.test.ts
    └── integration/nearby-reports-adapter.test.ts

frontend/
└── assets/js/report-flow.js # Existing no-results behavior is regression-tested only

tests/e2e/
└── nearby-report-check.spec.ts
```

**Structure Decision**: Filter raw nearby reports in `backend/src/adapters/love-clean-streets/
nearby-reports.ts`, before constructing the existing safe summary and before the API route serializes
any report. Reuse the existing category constant from `backend/src/domain/report.ts` so reporting and
duplicate detection refer to the same fly-tipping category. The frontend continues to receive either
a complete relevant list or the existing empty-list outcome.

## Complexity Tracking

No constitution violations require justification.
