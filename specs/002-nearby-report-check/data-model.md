# Data Model: Check Nearby Reports

All entities are transient. They MUST NOT be persisted, logged, or attached to resident history.

## NearbyReportLookup

| Field | Description | Validation / rules |
|---|---|---|
| `location` | Browser-provided incident location used for lookup. | Required; use the current accepted report-flow location; never expose in logs or frontend report summaries. |
| `state` | Lookup state. | `loading`, `reports-found`, `no-results`, or `unavailable`. |
| `reports` | Complete safe-summary list returned by the backend. | Present only for `reports-found`; preserve target result order; no silent cap or pagination. |

## NearbyReportSummary

| Field | Description | Validation / rules |
|---|---|---|
| `id` | Target report identifier. | Required; display only as an identifying reference. |
| `categoryName` | Target category label. | Required when supplied. |
| `recordedAt` | Target-recorded date/time. | Display in a resident-readable local format when supplied. |
| `locationLabel` | Address/location label supplied by target. | Display when supplied; never include raw coordinates. |
| `statusName` | Target report status. | Display when supplied. |
| `description` | Target report description. | Include only when the target marks the report approved and a description is available. |

## DuplicateCheckDecision

| Field | Description | Validation / rules |
|---|---|---|
| `answer` | Resident answer about the current nearby-report list. | `match`, `no-match`, or unset. |
| `effect` | Reporting-flow consequence. | `match` discards draft and terminates flow; `no-match` unlocks existing report details. |

## State Transitions

```text
location acquired
  → nearby-loading
  → reports-found → awaiting-decision → match → stopped/discarded
                                      └→ no-match → existing report details
  → no-results → existing report details
  → unavailable → nearby-loading (retry only)

cancel / session end from any state → discarded
```
