# Report Page Rendering Contract

## Purpose

The resident-facing `/report` HTML contract remains stable while its implementation moves to Handlebars.
All routes, methods, response statuses, redirects, form field names, and submitted control values remain
unchanged.

## Document contract

Every report page returns an HTML document with:

- `<!doctype html>` and `lang="en-GB"`;
- UTF-8 and responsive viewport metadata;
- a title in the form `<page title> | Street Sorted`;
- `/report.css` and the existing `<main class="page"><h1>Street Sorted</h1>…</main>` structure;
- `/location-helper.js` deferred only on the location-entry page.

Pages must not add a SPA root, client-side route shell, or a required report-page script.

## Stable form contract

| Page/state                 | Form action                    | Required fields / controls                                                     |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Location                   | `POST /report/location`        | `csrf`, `latitude`, `longitude`; submit label `Check nearby reports`.          |
| Nearby reports found       | `POST /report/nearby/decision` | `csrf`; `decision=match` and `decision=continue` submit controls.              |
| Nearby no results          | `POST /report/nearby/decision` | `csrf`, hidden `decision=continue`; submit label `Continue to report details`. |
| Nearby unavailable         | `POST /report/nearby/retry`    | `csrf`; submit label `Retry nearby reports`.                                   |
| Details                    | `POST /report/details`         | `csrf`, `description`; submit label `Review report`.                           |
| Review confirmation        | `POST /report/submit`          | `csrf`, hidden `confirmed=yes`; submit label `Confirm submission`.             |
| Review edit                | `POST /report/review/edit`     | `csrf`; submit label `Edit report`.                                            |
| Retry outcome              | `POST /report/submit/retry`    | `csrf`, hidden `confirmed=yes`; submit label `Try submission again`.           |
| Eligible in-progress pages | `POST /report/cancel`          | `csrf`; submit label `Cancel`.                                                 |

## Dynamic-content contract

- Dynamic values use escaped Handlebars interpolation.
- The renderer must not use raw/unescaped dynamic insertion.
- Error messages remain in an alert region with a list.
- The `reports-found`, `no-results`, and `unavailable` nearby states retain their existing message,
  available actions, and result display ordering.
- A recovery page retains a resident-visible alert and a `/report` link labeled `Start a new report`.

## Non-HTML interface preservation

The `/api` routes, Love Clean Streets adapters, report-session cookie format, anti-forgery validation,
report submissions, and nearby lookup contract are out of scope and unchanged by this feature.
