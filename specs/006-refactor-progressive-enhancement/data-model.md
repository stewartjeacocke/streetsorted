# Data Model: Refactor Client for Progressive Enhancement

## Report Draft Session

A short-lived server-side record representing one resident's active report journey.

| Field | Description | Validation / lifecycle |
|---|---|---|
| session ID | Opaque identifier stored only in the session cookie | High-entropy value; never logged; expires with the draft |
| CSRF token | Opaque value required by every state-changing report form | Bound to the session; regenerated with a new draft; never accepted from URLs |
| last activity | Time of the last valid request that used the draft | Draft expires after 5 minutes of inactivity |
| stage | Current reporting stage | `location`, `nearby`, `details`, or `review`; requests must follow valid transitions |
| location | Valid latitude, longitude, optional accuracy, and capture time | Latitude -90..90; longitude -180..180; capture time must satisfy the existing freshness rule before review/submission |
| description | Resident's report description | Trimmed, required before review, maximum 1,000 characters |
| nearby status | Latest duplicate-check result state | `found`, `none`, or `unavailable`; transient and refreshed on retry |
| nearby reports | Sanitized nearby summaries shown to the resident | Contains only the existing safe display fields; discarded when the session ends |

The session store MUST delete the record on resident cancellation, a confirmed submission, or a
non-retryable failure. For an unconfirmed, retryable submission outcome, it MAY retain the draft only
until the five-minute inactivity expiry so the resident can retry.

## Submission Outcome

A transient server-rendered result of attempting an explicitly confirmed report submission.

| Field | Description |
|---|---|
| state | `confirmed`, `unconfirmed`, or `failed` from the existing submission domain |
| resident message | Safe resident-facing explanation of the outcome |
| reference | Submission reference when supplied |
| retry allowed | Whether the resident can retry from the retained active draft |

Terminal outcomes clear the associated Report Draft Session before the rendered response completes.

## State Transitions

```text
location --valid location--> nearby
nearby --no duplicate / continue--> details
details --valid description--> review
review --edit--> details
review --confirmed submit--> confirmed outcome (session cleared)
review --retryable unconfirmed submit--> retryable outcome (session retained until expiry)
any active stage --cancel / expiry--> location (prior session cleared)
invalid or out-of-sequence request --> recoverable location or last valid stage
```
