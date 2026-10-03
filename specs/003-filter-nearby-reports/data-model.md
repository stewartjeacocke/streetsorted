# Data Model: Filter Nearby Reports

The filter operates on request-local target records before safe summaries are created. Neither raw
records nor excluded records are persisted or logged.

## RawNearbyReport Classification Fields

| Field | Meaning | Relevance rule |
|---|---|---|
| `CategoryId` | Target category identifier. | MUST equal `16144`. |
| `Completed` | Target completion state. | MUST be explicitly `false`. |

## RelevantNearbyReport

A report qualifies for safe-summary mapping only when both classification rules pass. Every
qualifying report is retained in target order. A record with a missing or invalid category or
completion field is excluded. The status label is display information only and does not affect
filtering.

## Filtered Nearby-Report Result

| Outcome | Condition |
|---|---|
| `reports-found` | One or more relevant nearby reports remain after filtering. |
| `no-results` | The target returned no reports, or filtering excluded every target report. |
| `unavailable` | The target lookup failed or returned an invalid payload. |
