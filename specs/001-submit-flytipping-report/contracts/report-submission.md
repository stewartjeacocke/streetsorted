# Report Submission UI and Service Contract

## Scope

This contract describes the interface between the separately deployed Jekyll frontend and the
Node.js backend service. The backend allows requests only from the configured Jekyll-site origin.
The Jekyll site uses browser-native JavaScript for the interactive flow. The backend does not expose
the target service's cookies, tokens, internal category IDs, or markup as a public contract.

## Resident-flow contract

### Required input

| Field | Source | Rules |
|---|---|---|
| `location` | Browser location permission | Required; browser-provided; immutable; retry location detection if unavailable. |
| `description` | Resident input | Required; plain text; validated before final review and again by the server. |
| `category` | Application | Always fly-tipping; submitted to the target as hard-coded category ID `16144`; not presented as a selectable control. |
| `confirmed` | Resident review action | Must be explicitly true for a submission request. |

Photo uploads, contact details, account credentials, manual location entry, and category selection
are not accepted by this feature.

### Browser state responses

| State | Resident-visible behavior |
|---|---|
| `location-required` | Explain that location access is required and provide a retry action. |
| `details-in-progress` | Allow description entry after location is available. |
| `review` | Display location, fly-tipping category, and description; provide confirm and cancel actions. |
| `submitting` | Prevent duplicate confirmation while the attempt is in progress. |
| `confirmed` | Display the target-supplied confirmation/reference when available. |
| `unconfirmed` | State that the report was not confirmed; provide a retry path without claiming success. |
| `failed` | Explain validation or service failure in resident-safe language. |

## Application service contract

### `POST /api/reports`

Creates exactly one attempt to submit the reviewed fly-tipping report to the target service. The
Jekyll site's browser JavaScript calls this endpoint over HTTPS; the backend accepts cross-origin
requests only from the configured Jekyll-site origin and rejects requests from all other origins.

**Request body**

```json
{
  "category": "fly-tipping",
  "location": {
    "latitude": 51.5,
    "longitude": -0.1,
    "accuracyMeters": 20,
    "capturedAt": "2026-10-03T12:00:00Z"
  },
  "description": "Waste dumped beside bins.",
  "confirmed": true
}
```

The JSON values above are illustrative only. The request MUST be rejected without contacting the
target when the category differs, the location is missing, the description is invalid, or
`confirmed` is not true.

**Success response**

```json
{
  "state": "confirmed",
  "reference": "target-supplied-reference-or-null",
  "residentMessage": "Your report was submitted.",
  "retryAllowed": false
}
```

**Ambiguous/failure response**

```json
{
  "state": "unconfirmed",
  "reference": null,
  "residentMessage": "We could not confirm that the report was submitted.",
  "retryAllowed": true
}
```

### Server obligations

1. Validate the request and confirmation flag before starting target interaction.
2. Create an anonymous target context inside the submission attempt.
3. Fetch the current target form state and apply hard-coded category ID `16144` for standard
   “Dumped or flytipped waste.”
4. Submit only the fixed category, browser-provided location, and resident description.
5. Normalize the target response to `confirmed`, `unconfirmed`, or `failed`.
6. Discard target cookies, tokens, report data, and target response body after the response has been
   generated.
7. Never write report text, location, cookies, anti-forgery tokens, or full target responses to logs.

## Adapter boundary

The adapter receives a validated `ReportDraft` and returns a `SubmissionOutcome`. Its target-facing
request shape is intentionally private because it relies on the target service's current HTML form
and may change independently. Adapter parsing tests MUST use stored, sanitized fixtures; release
validation MUST confirm compatibility with an authorized non-production or manually approved flow.
