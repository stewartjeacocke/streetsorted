# Geographic Authority Lookup Contract

## Purpose

Resolve a validated resident coordinate to the council authority used to route a report. The external
provider is the sole authority for routing under the feature specification.

## Outbound request

| Property        | Contract                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Provider        | Configured MapIt-compatible geographic authority provider.                                            |
| Input           | Decimal `latitude` and `longitude` only.                                                              |
| Authentication  | Optional provider credential from server runtime configuration only.                                  |
| Prohibited data | Description, report reference, session/cookie values, location accuracy, and all other resident data. |
| Timeout         | Use the application's bounded upstream-request timeout.                                               |

## Response mapping

| Provider result                                                                                     | Application result         | Resident behavior                                                                                              |
| --------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Exactly one authority identifier maps to an active `CouncilProfile`                                 | `assigned` with profile id | Continue to `/report/nearby`.                                                                                  |
| No returned authority maps to an active profile, or more than one active profile matches            | `unsupported`              | Remain on the location step, state that the location cannot currently be routed, and offer correction or exit. |
| Network failure, timeout, non-success response, malformed payload, or missing usable authority data | `unavailable`              | Retain coordinates, state that council identification is temporarily unavailable, and offer retry or exit.     |

## Safety requirements

- The lookup adapter must not infer a council from display-name similarity or choose arbitrarily among
  multiple results.
- The caller must perform no nearby-report or Love Clean Streets submission operation until it
  receives `assigned`.
- The authority identifier is matched only against the validated, active profile catalogue.
- Provider credentials and raw provider payloads must not appear in resident pages or application logs.
