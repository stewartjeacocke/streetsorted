# Data Model: Handlebars Report Views

This feature introduces presentation-only view models. It does not change persisted data, report sessions,
external API payloads, or route inputs.

## Shared layout context

| Field            | Type           | Rules                                                                         |
| ---------------- | -------------- | ----------------------------------------------------------------------------- |
| `title`          | string         | Page title prefix; template adds the existing Street Sorted suffix.           |
| `locationHelper` | boolean        | True only for location entry; controls the optional deferred helper script.   |
| block content    | template block | Trusted static template structure only; never constructed from dynamic input. |

## Reusable presentation values

| Field                   | Type     | Source and rules                                                                  |
| ----------------------- | -------- | --------------------------------------------------------------------------------- |
| `csrfToken`             | string   | Existing active report draft; emitted in every existing POST form.                |
| `messages`              | string[] | Existing validation errors; empty omits the error summary.                        |
| `latitude`, `longitude` | string   | Submitted safe values for location correction, or empty strings.                  |
| `locationDisplay`       | string   | Existing location formatted to five decimal places.                               |
| `description`           | string   | Existing draft or submitted safe value; rendered as escaped textarea/review text. |

## Page view models

### Location view

| Field                   | Type     | Validation / behavior                              |
| ----------------------- | -------- | -------------------------------------------------- |
| `csrfToken`             | string   | Required hidden form value.                        |
| `messages`              | string[] | Displays in shared error partial when non-empty.   |
| `latitude`, `longitude` | string   | Retain posted values following validation failure. |

### Nearby view

| Field             | Type                                             | Validation / behavior                                                                   |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `csrfToken`       | string                                           | Required for decision, retry, and cancel forms.                                         |
| `locationDisplay` | string                                           | Derived from the required draft location.                                               |
| `state`           | `reports-found` \| `no-results` \| `unavailable` | Maps directly from existing nearby result state.                                        |
| `reports`         | nearby-report display rows                       | Used only for `reports-found`; each row is an ordered list of non-empty summary values. |
| `residentMessage` | string                                           | Used only for `unavailable`; escaped alert text.                                        |

A nearby-report display row contains `categoryName`, `recordedAt`, `locationLabel`, `statusName`, and
`description`, each nullable in the source. The adapter excludes absent values and exposes a single
already-ordered display value list so the template never joins or evaluates domain fields.

### Details view

| Field         | Type     | Validation / behavior                                                                             |
| ------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `csrfToken`   | string   | Required hidden form value.                                                                       |
| `messages`    | string[] | Displays in shared error partial when non-empty.                                                  |
| `description` | string   | Draft description or submitted correction value; retains the existing 1,000-character form limit. |

### Review view

| Field             | Type   | Validation / behavior                         |
| ----------------- | ------ | --------------------------------------------- |
| `csrfToken`       | string | Required for confirm, edit, and cancel forms. |
| `locationDisplay` | string | Derived from the required draft location.     |
| `description`     | string | Required review text, escaped by template.    |

### Outcome view

| Field       | Type                | Validation / behavior                                        |
| ----------- | ------------------- | ------------------------------------------------------------ |
| `message`   | string              | Required resident outcome text.                              |
| `reference` | string \| null      | Omitted from the page when null or empty.                    |
| `retry`     | boolean             | Shows the retry form only when true and a CSRF token exists. |
| `csrfToken` | string \| undefined | Required when `retry` is true.                               |

### Recovery view

| Field     | Type   | Validation / behavior                                       |
| --------- | ------ | ----------------------------------------------------------- |
| `message` | string | Required escaped alert text and link to start a new report. |

## State and ownership

- The existing `ReportDraftSession` remains authoritative for report stage, location, description, nearby
  result, and CSRF token.
- Route handlers continue to enforce stage validity, session expiration, CSRF checks, redirects, status
  codes, cancellation, and retry eligibility before selecting a view.
- View-model adapters are one-way transformations; templates cannot mutate report-session data.
