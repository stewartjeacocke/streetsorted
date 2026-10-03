# Data Model: Displayed Lookup Location

## DetectedLocation

Existing transient report-flow state containing full browser-provided `latitude` and `longitude`.
These values continue unchanged to the nearby lookup.

## DisplayedLookupLocation

| Field | Source | Rule |
|---|---|---|
| `latitude` | `DetectedLocation.latitude` | Display rounded to five decimal places. |
| `longitude` | `DetectedLocation.longitude` | Display rounded to five decimal places. |

Displayed values are derived only while a current detected location exists. They are not stored,
logged, or sent separately to the backend.
