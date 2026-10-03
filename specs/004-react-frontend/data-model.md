# Data Model: React Report Flow

All state is held in the mounted React application and is discarded on cancellation, reset, or page
refresh. No entity below is persisted or logged by the frontend.

## ReportFlowState

| Field | Description | Rules |
|---|---|---|
| `step` | Current resident step. | `location`, `nearby-loading`, `nearby-decision`, `details`, `review`, `submitting`, `outcome`, or `stopped`. |
| `location` | Browser-provided incident location. | Required before nearby lookup; refresh when stale; immutable to the resident. |
| `nearbyResult` | Existing backend nearby-report response. | Display safe summaries only; discard on cancellation/reset. |
| `description` | Resident report description. | Required before review; discard on cancellation/reset. |
| `outcome` | Existing backend submission or stopped outcome. | Render resident-safe message/reference only. |

## State Transitions

```text
location → nearby-loading → nearby-decision → details → review → submitting → outcome
                          ├→ no-results → details
                          ├→ unavailable → nearby-loading (retry)
                          └→ match → stopped

cancel / reset / page refresh → location with no retained data
```

## Frontend API Results

The React application consumes the existing nearby lookup and report submission response shapes
without adding fields or persisting raw payloads.
