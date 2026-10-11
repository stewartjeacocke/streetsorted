# Data Model: Postcode Location Input

## FullPostcode

The resident-entered location value after validation and normalization.

| Field | Type | Rules |
|-------|------|-------|
| `postcode` | string | Required full UK postcode. Trim surrounding whitespace, tolerate casing/spacing variations, and use the provider's canonical uppercase postcode for display and storage in the transient draft. |

**Invalid states**: empty, partial (area or district only), malformed, provider-unlocatable, and
outside the supported council set. Partial/malformed/unlocatable/unsupported values never advance the
report flow.

## ResolvedPostcodeLocation

The adapter result used after resolving a resident's submitted postcode.

| Field | Type | Rules |
|-------|------|-------|
| `postcode` | string | Canonical full postcode from the provider. |
| `latitude` | number | Finite, within -90 to 90. Not resident-facing. |
| `longitude` | number | Finite, within -180 to 180. Not resident-facing. |

**Relationship**: `ResolvedPostcodeLocation` supplies an existing `IncidentLocation` plus the
canonical selected postcode. `capturedAt` is created by the server at successful form submission to
preserve the existing location-freshness rule.

## SuggestedPostcode

An optional value produced from permitted browser location before location-form submission.

| Field | Type | Rules |
|-------|------|-------|
| `postcode` | string | The first/closest canonical full postcode returned by reverse geocoding. It is advisory only and can be replaced by the resident. |

The suggestion does not update the report draft, does not advance the report stage, and is discarded
from browser memory when the page ends or changes.

## ReportDraftSession changes

| Existing/Added Field | Type | Lifecycle |
|----------------------|------|-----------|
| `location` (existing) | `IncidentLocation` | Created from the final submitted postcode and used unchanged by downstream routing, nearby lookup, and submission. |
| `postcode` (added) | string  `undefined` | Canonical full postcode selected for the incident; set with `location`, replaced by a corrected location submission, and cleared on cancellation, completion, or expiry. |
| `stage` (existing) | `location`  `nearby`  `details`  `review` | Unchanged. A suggestion leaves it at `location`; a resolved supported postcode advances it according to existing council capability. |

## State transitions

```text
location form
  ├── invalid / partial postcode ────────────────> location (retain submitted value)
  ├── postcode not found / unsupported council ─> location (retain submitted value)
  ├── provider unavailable ─────────────────────> location (retain submitted value; retry)
  └── full postcode resolves + council assigned ─> nearby or details

optional suggestion request
  ├── closest postcode returned ─────────────────> location (prefill field only)
  └── no result / failure / denied permission ───> location (manual entry unchanged)
```

## Privacy and retention

- No new persistent storage is created.
- Browser-provided coordinates exist only in the helper request body and are not put in URLs, browser
  storage, or the report draft.
- The canonical submitted postcode and resolved coordinates exist only in the existing draft session
  until its current clear/expiry behavior applies.
- Logging redacts postcode, latitude, longitude, and accuracy values.
