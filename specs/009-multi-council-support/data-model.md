# Data Model: Multi-Council Love Clean Streets Support

## CouncilProfile

A validated configuration record for one council that can receive the existing anonymous
fly-tipping journey.

| Field                        | Rules                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                         | Stable internal identifier; unique across the catalogue.                                                                       |
| `displayName`                | Resident-facing council name; non-empty and used in outcome content.                                                           |
| `authorityLookupIdentifiers` | One or more identifiers returned by the geographic authority lookup; no identifier may belong to more than one active profile. |
| `active`                     | Only active profiles are eligible for automatic routing.                                                                       |
| `targetBaseUrl`              | Approved public Love Clean Streets reporting destination for the council.                                                      |
| `nearbyReportsBaseUrl`       | Approved nearby-report source for the council.                                                                                 |
| `flyTippingCategoryId`       | Positive council-specific identifier used for both submission and nearby filtering.                                            |
| `outOfAreaMessage`           | Resident-safe message template for a council rejection; must use the profile display name and must not claim submission.       |

### Catalogue invariants

- An active profile has every required reporting value and at least one authority-lookup identifier.
- An active authority-lookup identifier maps to exactly one active profile.
- Invalid, incomplete, duplicate, or disabled profiles are excluded from routing.
- The catalogue carries no boundary geometry; the geographic authority lookup remains the sole
  authority for location-to-council assignment.

## AuthorityLookupResult

The result of resolving a resident's coordinate with the external geographic authority provider.

| State         | Data               | Meaning and next state                                                                                                          |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `assigned`    | `councilProfileId` | Exactly one active profile matched the provider's authority identifier; the draft may move to `nearby`.                         |
| `unsupported` | none               | The provider returned no usable authority or one without an active profile; the draft stays at `location`.                      |
| `unavailable` | none               | The provider could not be contacted or returned unusable/ambiguous data; the draft stays at `location` with retry/exit actions. |

The outbound request contains only `latitude` and `longitude`. No description, report reference,
session value, location accuracy, or other resident data is passed to the provider.

## ReportDraftSession (extended)

The existing short-lived report draft is extended with routing data.

| Field                                                                                      | Rules                                                                                                                 |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Existing `id`, `csrfToken`, `stage`, `location`, `description`, `nearby`, `lastActivityAt` | Existing validation and five-minute session expiry remain unchanged.                                                  |
| `councilProfileId`                                                                         | Present only after an `assigned` result; must reference an active profile when used.                                  |
| `nearbyCouncilProfileId`                                                                   | Stored with a nearby result or represented equivalently; must equal `councilProfileId` before a decision is accepted. |

### State transitions

```text
new / location
  ├─ valid coordinates + assigned profile → nearby
  ├─ valid coordinates + unsupported lookup → location (show unsupported guidance)
  └─ valid coordinates + unavailable lookup → location (retain coordinates; retry or exit)

nearby
  ├─ matching existing report → cleared / informational outcome
  ├─ continue → details
  └─ location corrected → location (clear profile, description, nearby result)

details → review → confirmed submission outcome
review → location corrected → location (clear profile, description, nearby result)
```

A draft with no valid council profile assignment cannot enter nearby lookup, details, review, or
council submission. Any location replacement clears the prior council-scoped data.

## CouncilScopedNearbyResult

The existing nearby result is bound to both the submitted coordinate and `councilProfileId`.

| Rule           | Requirement                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Query source   | Use only the assigned profile's nearby-report source.                                                      |
| Relevance      | Include only active fly-tipping reports whose category matches the assigned profile's category identifier. |
| Reuse          | Discard on location or council-assignment change.                                                          |
| Unavailability | Preserve the draft and use the existing nearby retry behavior.                                             |

## SubmissionOutcome (extended presentation context)

The existing outcome states remain `confirmed`, `failed`, and `unconfirmed`. Presentation receives
the assigned council display name or other profile-safe context so that messages never incorrectly
refer to Islington or another council.

- `confirmed`: show only when target evidence establishes acceptance, including any returned reference.
- `failed`: include out-of-area and validation responses; never claim submission.
- `unconfirmed`: retain the existing safe retry behavior; never claim submission.
