# Implementation Plan: Multi-Council Love Clean Streets Support

**Branch**: `009-multi-council-support` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-multi-council-support/spec.md`

## Summary

Extend the existing progressive-enhancement fly-tipping journey from its single Islington target to
a validated catalogue of compatible Love Clean Streets councils. On location submission, resolve the
coordinate through a configured MapIt geographic authority lookup, match its authoritative result to
one active council profile, then use that profile for nearby-report filtering, anonymous Love Clean
Streets submission, and council-specific resident messages. Unsupported and unavailable routing
results fail closed without contacting a council; the existing report session, CSRF, rate-limiting,
retry, and no-JavaScript behaviors remain intact.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 26 (per `package.json`)

**Primary Dependencies**: Express 5, Zod, Axios with cookie-jar support, Cheerio, Handlebars;
MapIt-compatible geographic authority provider accessed through an isolated Axios adapter

**Storage**: In-memory five-minute report-draft session store; version-controlled validated council
profile catalogue; runtime environment configuration for provider endpoint and optional credential

**Testing**: Node built-in test runner through `tsx --test`, Supertest contract tests, Playwright
end-to-end tests, linting with ESLint, formatting with Prettier

**Target Platform**: Single Node.js HTTP service running on Linux-compatible server environments

**Project Type**: Server-rendered web application with JSON endpoints

**Performance Goals**: Correct routing takes precedence over latency. Routing performs one bounded
external authority lookup before existing external nearby/report calls; unavailable or malformed
responses fail closed and retain resident-entered coordinates for retry.

**Constraints**: The geographic provider is the sole routing authority; send only latitude and
longitude to it; council profile data must be validated and contain no secrets; no new service,
database, queue, SPA, or client-side routing; every journey must work through normal forms and
ordinary browser navigation without JavaScript.

**Scale/Scope**: One deployable with a catalogue covering every currently compatible public Love
Clean Streets council. Each active profile must have independent routing, nearby, submission, and
failure-classification fixtures.

## Constitution Check

### Pre-design gate — PASS

| Principle                              | Compliance plan                                                                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Secret Protection                   | Provider credentials are runtime-only configuration, never catalogued, browser-delivered, or logged. Location routing sends only latitude/longitude; council profile data uses public endpoints and identifiers. |
| II. Single Deployable by Default       | The profile catalogue, geographic-routing adapter, and all flow changes stay inside the existing Node service. No new process, service, database, or queue is introduced.                                        |
| III. Progressive Enhancement, Not SPAs | Council resolution is performed from the existing server-handled location form. Success, unsupported, unavailable, retry, correction, and exit flows use ordinary HTML forms and document navigation.            |

### Post-design gate — PASS

The research, model, contracts, and quickstart retain the single-service architecture, confine the
external authority provider behind a server-side adapter, protect credentials, and specify
JavaScript-disabled validation. No exception or complexity justification is required.

## Project Structure

### Documentation (this feature)

```text
specs/009-multi-council-support/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── authority-lookup.md
│   ├── council-profiles.md
│   └── report-pages.md
└── tasks.md                         # Created by $speckit-tasks
```

### Source Code (repository root)

```text
src/server/
├── adapters/
│   ├── authority-lookup/            # New MapIt-compatible lookup client and response mapping
│   └── love-clean-streets/          # Make nearby and submission operations profile-aware
├── config.ts                        # Add protected authority-provider runtime configuration
├── domain/
│   ├── council.ts                   # New profile, assignment, and routing-result domain rules
│   ├── nearby-report.ts             # Accept profile-specific category filtering
│   ├── report.ts                    # Remove fixed council/category assumptions
│   └── report-page-forms.ts
├── routes/
│   ├── report-pages.ts              # Resolve authority at the location step and guard later stages
│   ├── nearby-reports.ts            # Resolve authority before council-specific lookup
│   └── reports.ts                   # Resolve authority before council-specific submission
├── services/
│   ├── council-directory.ts         # New validated active-profile catalogue
│   ├── council-routing-service.ts   # New authority lookup/profile-match orchestration
│   ├── nearby-reports-service.ts    # Pass assigned profile to adapter
│   ├── report-draft-session-store.ts# Persist and invalidate council assignment
│   └── report-submission-service.ts # Pass assigned profile to adapter
└── views/
    └── report-pages.ts              # Display assigned council and routing recovery content

tests/
├── e2e/
│   └── report-progressive-enhancement.spec.ts
└── server/
    ├── contract/                    # Page/JSON routing and no-cross-council assertions
    ├── integration/                 # Authority and Love Clean Streets profile adapter checks
    ├── support/                     # Multi-council and authority-lookup mocks
    └── unit/                        # Profile validation, assignment, invalidation, and views
```

**Structure Decision**: Keep the existing single TypeScript/Express service. Add focused domain,
service, and adapter modules within `src/server`; retain the current test hierarchy and enhance the
existing report pages instead of adding a separate frontend or service.

## Complexity Tracking

No constitution violations or justified complexity additions.
