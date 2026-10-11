# Implementation Plan: Postcode Location Input

**Branch**: `011-postcode-location-input` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-postcode-location-input/spec.md`; use `node-postcodes.io` for postcode lookup and reverse geocoding.

## Summary

Replace resident-facing coordinate entry with a full UK postcode field. Resolve the submitted postcode
through `node-postcodes.io` to retain the existing coordinate-based council routing, nearby-report,
and submission integrations. Enhance the server-rendered location page by asking the browser for the
resident's current position and posting it to a same-origin suggestion endpoint; that endpoint uses
the same adapter to return the closest full postcode without storing the browser location. The
postcode remains editable and becomes the resident-facing location display throughout the report flow.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting ES2024; Node.js 26

**Primary Dependencies**: Express 5, Handlebars 4, Zod 3, Axios 1; add `node-postcodes.io` 1.0.3
for postcode lookup and reverse geocoding

**Storage**: Existing in-memory, browser-associated report-draft session only; no database or browser
storage

**Testing**: Node's built-in test runner via `tsx --test`, Playwright end-to-end tests, TypeScript
compile, ESLint, and Prettier

**Target Platform**: Server-rendered Node.js web service deployed as one process; modern browsers with
a fully functional no-JavaScript fallback

**Project Type**: Web service with server-rendered HTML and a small progressive-enhancement script

**Performance Goals**: Valid full-postcode submissions complete the location step on the first attempt
for at least 95% of tested cases; when permission and a nearby postcode are available, populate the
suggestion within 10 seconds

**Constraints**: Accept full UK postcodes only; never present latitude/longitude to residents; keep
postcode and coordinates out of logs and browser storage; preserve existing five-minute transient
draft lifetime and CSRF protection; current-location suggestion must be optional and must not overwrite
resident input

**Scale/Scope**: One existing report flow, one new runtime dependency, one outbound postcode provider,
and the existing supported-council set; no new service, queue, datastore, SPA, or client-side routing

## Constitution Check

| Principle | Design response | Gate |
|-----------|-----------------|------|
| I. Secret Protection | No credentials are introduced. Postcode, browser coordinates, and resolved coordinates are treated as sensitive location data and redacted from logs; they are never stored in browser storage. | Pass |
| II. Single Deployable by Default | Postcode lookup runs through an adapter in the existing server process and calls the selected public provider directly. No process, queue, or datastore is added. | Pass |
| III. Progressive Enhancement, Not SPAs | `GET /report` and `POST /report/location` remain ordinary server-rendered navigation and forms. The current-location suggestion endpoint is optional enhancement only; manual full-postcode reporting works with JavaScript disabled or permission denied. | Pass |

**Pre-design gate:** Pass. No constitution exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/011-postcode-location-input/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── report-location.md
└── tasks.md                 # Created by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── adapters/
│   │   ├── authority-lookup/mapit.ts        # Existing council lookup, retained
│   │   └── postcode-lookup/postcodes-io.ts  # New node-postcodes.io boundary
│   ├── domain/
│   │   ├── postcode.ts                      # New normalized-postcode and result types/schemas
│   │   ├── report-page-forms.ts             # Replace coordinate form validation
│   │   └── report.ts                        # Existing downstream coordinate model, retained
│   ├── middleware/logger.ts                 # Redact postcode values
│   ├── public/location-helper.js            # Optional location-to-postcode suggestion
│   ├── routes/report-pages.ts               # Postcode submission and suggestion endpoint
│   ├── services/
│   │   ├── postcode-location-service.ts     # Resolve and suggest locations
│   │   └── report-draft-session-store.ts    # Persist selected postcode transiently
│   └── views/
│       ├── report-pages.ts                  # Postcode presentation model
│       └── templates/location.hbs           # One postcode field
├── shared/templates/layout.hbs              # Existing optional helper inclusion, retained
└── static-site/                             # Unchanged

tests/
├── server/
│   ├── contract/report-pages.test.ts
│   ├── integration/postcodes-io-adapter.test.ts
│   └── unit/
│       ├── postcode-location-service.test.ts
│       ├── report-draft-session.test.ts
│       └── html-views.test.ts
└── e2e/report-progressive-enhancement.spec.ts
```

**Structure Decision**: Extend the existing server-rendered Express application. The provider wrapper
is isolated behind a server-side adapter and service, while all established council, nearby-report,
and submission paths continue to consume the resolved `IncidentLocation` coordinate shape.

## Post-Design Constitution Check

| Principle | Verification after design | Gate |
|-----------|---------------------------|------|
| I. Secret Protection | `contracts/report-location.md` requires a body-only, same-origin suggestion request, no coordinate query parameters, no persistent client storage, and redaction of `postcode` alongside existing location data. | Pass |
| II. Single Deployable by Default | `node-postcodes.io` is called by an adapter inside the existing process. The external postcode provider is an ordinary outbound dependency with explicit unavailable/not-found outcomes. | Pass |
| III. Progressive Enhancement, Not SPAs | The design retains HTML form submission as the only required reporting path. The script only fills an editable field after successful optional lookup and does not add routing or an application state store. | Pass |

**Post-design gate:** Pass. No complexity tracking entry is needed.
