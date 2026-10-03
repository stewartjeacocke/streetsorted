# Implementation Plan: Migrate React Frontend

**Branch**: `004-react-frontend` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-react-frontend/spec.md`

## Summary

Replace the Jekyll resident-facing frontend with a React single-page application built and served by
a Node.js 26 toolchain. Preserve the existing backend contracts and all resident-visible report-flow
behavior: location, filtered nearby-report lookup, duplicate stop, no-results continuation, details,
review, explicit confirmation, cancellation, and outcomes. Upgrade the existing backend, shared test
tooling, and production container/runtime declarations from Node.js 24 to Node.js 26. Remove Jekyll,
Ruby, and obsolete static-frontend files from the supported project workflow.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 26 for frontend, backend, test tooling, and containers

**Primary Dependencies**: React, React DOM, Vite, existing Express/Zod/Axios backend dependencies,
Vitest, Supertest, and Playwright

**Storage**: N/A — React state remains in-memory only; no browser storage, database, queue, or
persistent session store is introduced

**Testing**: Vitest for backend and React state/component behavior; Supertest for backend contracts;
Playwright for the full React frontend, backend, and mock-target flow

**Target Platform**: Modern browsers; Node.js 26 Linux backend container; static hosting for the
Vite production frontend build

**Project Type**: React static frontend plus the existing single Node.js backend service

**Performance Goals**: Existing mock-target browser flow remains within 10 seconds from location
acquisition to nearby report/details availability; production frontend build succeeds without Ruby
or Jekyll

**Constraints**: Preserve backend API shapes and origin restrictions; do not call the council service
from the browser; retain no draft, nearby result, or duplicate decision after refresh/cancellation;
remove Ruby/Jekyll from supported build/development/deployment paths; upgrade all engine and container
constraints to Node.js 26

**Scale/Scope**: One React application replacing one Jekyll application; one backend service; no
accounts, persistence, new endpoints, new external integrations, or second resident-facing frontend

## Constitution Check

| Gate | Pre-design status | Post-design status | Evidence |
|---|---|---|---|
| No secrets in source or logs | Pass | Pass | Existing API boundary, redaction, and frontend environment handling remain; no runtime secrets are placed in browser code. |
| Single deployable by default | Pass with documented split | Pass with documented split | The existing static frontend plus one backend-service architecture remains; no new backend process or queue is introduced. |
| New process/service has written justification | Pass | Pass | React build tooling replaces Jekyll tooling only; the backend remains the sole runtime service. |
| Material configuration/tooling change receives compliance review | Pass | Pass | Review includes Node.js 26 engines/images, frontend origin configuration, build environment values, and removal of Ruby/Jekyll paths. |

## Project Structure

### Documentation (this feature)

```text
specs/004-react-frontend/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── frontend-api.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── report-api.ts
│   ├── components/
│   │   ├── LocationStep.tsx
│   │   ├── NearbyReportsStep.tsx
│   │   ├── ReportDetailsStep.tsx
│   │   ├── ReviewStep.tsx
│   │   └── OutcomeStep.tsx
│   ├── hooks/
│   │   └── useReportFlow.ts
│   └── styles/
│       └── app.css
└── tests/
    └── unit/

backend/
├── package.json
├── Dockerfile
├── src/
└── tests/

tests/e2e/
└── report-flow.spec.ts
```

**Structure Decision**: Replace `frontend/` Jekyll pages, layouts, and browser modules with one React
application. A React hook/reducer owns the in-memory report-flow state; presentation components own
individual resident steps. A dedicated frontend API client remains the only browser-to-backend
boundary. The backend source layout and API contracts remain stable except for Node.js 26 runtime
metadata. Playwright starts the Vite frontend, existing mock target, and existing backend.

## Complexity Tracking

| Violation / deviation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Static frontend migration from Jekyll to React | The user explicitly requires a React/Node.js frontend while preserving a separate static site and one backend service. | Retaining Jekyll conflicts with the requested React rewrite and would leave two supported frontend paths. |
