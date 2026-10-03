# Data Model: Submit Fly-tipping Report

All entities below are transient. They are browser-memory or request-local values and MUST NOT be
persisted, logged, or used to create resident history.

## ReportDraft

| Field | Description | Validation / rules |
|---|---|---|
| `category` | Fixed report category. | Always `fly-tipping`; residents cannot change it. |
| `location` | Browser-provided incident location. | Required; created only after resident grants permission; no manual editing. |
| `description` | Resident's plain-language description of the fly-tipping. | Required; validate against current target-service required-field and length rules before submission. |
| `status` | Resident-flow state. | See state transitions below. |

## IncidentLocation

| Field | Description | Validation / rules |
|---|---|---|
| `latitude` | Browser-provided latitude. | Required only for the active session and final submission request. |
| `longitude` | Browser-provided longitude. | Required only for the active session and final submission request. |
| `accuracyMeters` | Reported accuracy of the location. | Carry to the adapter when available; do not display false precision. |
| `capturedAt` | Time the browser supplied the position. | Used only to assess current-session freshness; never persisted. |

## SubmissionOutcome

| Field | Description | Validation / rules |
|---|---|---|
| `state` | Result of the target submission attempt. | `confirmed`, `unconfirmed`, or `failed`. |
| `reference` | Target-supplied report reference. | Present only for a confirmed result when supplied by the target. |
| `residentMessage` | Safe explanation shown to the resident. | Must not expose cookies, tokens, target HTML, stack traces, or precise location. |
| `retryAllowed` | Whether the resident can retry. | True for unconfirmed/temporary failures; false when input remains invalid until corrected. |

## TargetSubmissionContext

| Field | Description | Validation / rules |
|---|---|---|
| `anonymousSession` | Request-local target cookies/session context. | Created by the adapter; discarded after the attempt; never returned to the browser. |
| `antiForgeryToken` | Form token obtained from the target report page. | Request-local; submit only to the target form; never log or persist. |
| `flyTippingCategoryId` | Target category identifier. | Always the application constant `16144` for standard “Dumped or flytipped waste”; do not expose it to residents or persist it. |

## State Transitions

```text
location-required
  ├─ location granted → details-in-progress
  └─ denied / unavailable → location-required (show explanation; retry available)

details-in-progress
  ├─ valid description → review
  └─ cancel / session end → discarded

review
  ├─ confirm → submitting
  ├─ edit description → details-in-progress
  └─ cancel / session end → discarded

submitting
  ├─ target success → confirmed
  ├─ ambiguous target/network result → unconfirmed
  └─ target validation or recoverable failure → failed

confirmed / unconfirmed / failed
  └─ session end → discarded
```

## Relationships

A `ReportDraft` has one `IncidentLocation` and produces at most one `SubmissionOutcome` per final
submission attempt. A `TargetSubmissionContext` is created only while an adapter processes an
attempt and is not part of the resident-visible model.
