# Implementation Plan: Refactor Report Views to Handlebars Templates

**Branch**: `007-refactor-handlebars-templates` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-refactor-handlebars-templates/spec.md`

## Summary

Replace the current string-concatenated resident report views with cached, server-side Handlebars templates.
Keep the existing Express routes and synchronous page-rendering API as thin view-model adapters; introduce a
shared partial-block document layout and page templates for location, nearby-result variants, details,
review, outcome, and recovery. Preserve every current form contract, server-side workflow, safe escaping,
and JavaScript-optional behavior.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 26.x (ES2024, NodeNext modules)

**Primary Dependencies**: Express 5.1; add `handlebars` `^4.7.9` for server-side templates

**Storage**: Existing in-memory server-side `ReportDraftSessionStore`; no new storage

**Testing**: Node test runner via `tsx --test`, Supertest contract tests, Playwright end-to-end tests

**Target Platform**: Node.js web server; browser HTML forms with JavaScript optional

**Project Type**: Single-deployable server-rendered web application

**Performance Goals**: Preserve the existing resident flow; compile and cache templates once per process so
rendering adds no request-time template filesystem I/O or compilation

**Constraints**: Preserve existing routes, methods, status codes, redirects, form field names/control values,
CSRF/session behavior, visible text, safe HTML encoding, and non-SPA progressive enhancement; copy templates
into the production distribution but never serve them as public assets

**Scale/Scope**: One existing report flow: shared layout, error summary, and six page templates covering
location, nearby reports, report details, review, outcome, and recovery

## Constitution Check

| Principle / constraint                 | Plan response                                                                                                                                         | Status |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Secret Protection                   | No secret, token, or credential handling changes. View contexts contain only existing resident-facing values and active CSRF form values.             | Pass   |
| II. Single Deployable by Default       | Templates and renderer remain inside the existing Node.js application; no service, queue, or frontend deployment is introduced.                       | Pass   |
| III. Progressive Enhancement, Not SPAs | HTML is rendered on the server; all report actions remain ordinary forms and document navigation. The existing location helper remains optional only. | Pass   |
| Delivery and review constraints        | Build copies private runtime templates into `dist/server`; validation covers JavaScript-disabled journeys and safe rendering.                         | Pass   |

**Post-design re-check**: Pass. The selected cached server renderer, private runtime template assets, and
unchanged form routes preserve all core principles; no exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/007-refactor-handlebars-templates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── report-pages.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/server/
├── dev/static-assets.ts                 # Copy public assets and private view templates for production
├── views/
│   ├── renderer.ts                      # Cached Handlebars loader/renderer and partial registration
│   ├── report-pages.ts                  # Existing route-facing functions mapped to explicit view models
│   └── templates/
│       ├── layout.hbs                   # Shared document shell, supplied through a partial block
│       ├── errors.hbs                   # Shared error-alert list
│       ├── location.hbs
│       ├── nearby.hbs
│       ├── details.hbs
│       ├── review.hbs
│       ├── outcome.hbs
│       └── recovery.hbs
├── public/
│   ├── report.css
│   └── location-helper.js
└── routes/report-pages.ts               # Unchanged route/session/response contract

tests/
├── server/unit/html-views.test.ts       # Renderer/layout, escaping, and page-state unit coverage
├── server/contract/report-pages.test.ts # Form, route, status, CSRF, recovery, and retry contract coverage
└── e2e/report-progressive-enhancement.spec.ts
```

**Structure Decision**: Keep the current single server project. Add private Handlebars templates beside the
view renderer, retain the route-facing view module so routes need no behavioral change, and extend the
existing production asset-copy step to carry templates to the matching distribution path.

## Implementation Design

1. Add the direct `handlebars` dependency and a `views/renderer.ts` module. At module initialization, resolve
   the templates directory relative to the renderer module, read known `.hbs` files, compile page templates,
   and register layout/error partials. Export a synchronous `render(templateName, context)` function. Do not
   expose unescaped rendering helpers or arbitrary template names.
2. Replace `views/html.ts` string functions with the renderer (or remove the module after callers are moved).
   Create the shared partial-block `layout.hbs`, which owns doctype, language, metadata, title suffix, stylesheet,
   main wrapper, product heading, and conditional optional location-helper script. Create `errors.hbs` for the
   existing alert/list markup.
3. Create one page template for each current page function. Use normal escaped interpolation exclusively;
   model the nearby result as an explicit state and keep domain-state branching in TypeScript. Preserve exact
   forms, fields, routes, hidden values, labels, headings, messages, `role="alert"`, and output ordering.
4. Keep `views/report-pages.ts` as the route-facing public module. Convert each existing page function into a
   small adapter that builds the documented view model and calls the named template. Retain five-decimal
   coordinate formatting and transform nullable nearby-report fields into ordered display values before render.
5. Extend `dev/static-assets.ts` so `npm run build` copies `views/templates` to `dist/server/views/templates`
   while continuing to copy only `public` to `dist/server/public`. Do not mount the template directory in
   Express static middleware.
6. Update unit tests to exercise template rendering, shared layout, dynamic escaping, optional helper inclusion,
   and all three nearby states. Preserve and strengthen contract/e2e checks for route/form compatibility,
   validation/recovery, retry paths, JavaScript-disabled reporting, and absence of SPA shell behavior.

## Complexity Tracking

No constitution violations or additional complexity justification required.
