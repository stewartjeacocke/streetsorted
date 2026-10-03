# Implementation Plan: Display Nearby Location

**Branch**: `005-display-nearby-location` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-display-nearby-location/spec.md`

## Summary

Add detected latitude and longitude context to the existing React nearby-reports step. The React
report-flow state already owns the transient location used for lookup; the migration adds a
five-decimal display value to the nearby UI without changing full-precision lookup coordinates,
backend contracts, storage, logging, or location-editing rules.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 26; existing React/Vite frontend and Node.js backend

**Primary Dependencies**: Existing React, Vite, Vitest, and Playwright dependencies; no new runtime
dependency

**Storage**: N/A — use existing in-memory React location state only

**Testing**: Existing React unit tests and Playwright nearby-report flow tests

**Target Platform**: Existing React/Vite static frontend and Node.js 26 project toolchain

**Project Type**: Existing React static frontend; no backend change

**Performance Goals**: Coordinate context appears with the nearby step without adding a backend
request or delaying the existing lookup

**Constraints**: Display latitude/longitude rounded to five decimal places; retain full precision for
lookup; clear values on reset/cancellation/initial location failure; do not add browser storage,
backend fields, or logs

**Scale/Scope**: One presentational value pair in existing React state/UI; no endpoint or external
integration change

## Constitution Check

| Gate | Pre-design status | Post-design status | Evidence |
|---|---|---|---|
| No secrets in source or logs | Pass | Pass | Coordinates remain in existing transient frontend state and no logging is added. |
| Single deployable by default | Pass | Pass | No new service, process, queue, or store is introduced. |
| Material configuration/tooling change receives compliance review | Pass | Pass | No runtime/configuration change is required. |

## Project Structure

### Documentation (this feature)

```text
specs/005-display-nearby-location/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── location-display.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── components/NearbyReportsStep.tsx
    ├── hooks/useReportFlow.ts
    ├── lib/location.ts
    └── hooks/useReportFlow.test.tsx

tests/e2e/
└── nearby-report-check.spec.ts
```

**Structure Decision**: Keep full coordinate values in the existing report-flow state and derive a
five-decimal string in the React nearby-report component. The component renders no location when the
state is absent, so reset and location-error paths cannot show stale data.

## Complexity Tracking

No constitution violations require justification.
