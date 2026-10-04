# Quickstart: Validate Multi-Council Support

## Prerequisites

- Node.js version permitted by `package.json`.
- Dependencies installed with `npm install`.
- A runtime configuration for the geographic authority lookup and at least two active council
  profiles. Do not commit provider credentials.
- Local mock services or approved non-production provider/council fixtures; do not submit validation
  reports to live public council services.

## Build and baseline checks

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

All commands must pass before feature-specific validation begins.

## Feature validation scenarios

| Scenario                    | Steps                                                                                                                               | Expected outcome                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Route an in-area location   | Start `/report`, submit a coordinate assigned to active council A, then continue through nearby, details, review, and confirmation. | The council is shown throughout; only A's nearby and report services are contacted; a confirmed result shows A's reference.            |
| Route a second council      | Repeat with a coordinate assigned to active council B.                                                                              | Only B's profile values are used; no A-specific category, nearby data, or message appears.                                             |
| Correct a location          | Begin with an A coordinate, reach a later step, return to location, and provide a B coordinate.                                     | The prior council assignment, description, and nearby result are discarded; subsequent requests use B only.                            |
| Unsupported location        | Submit a coordinate for which the provider returns no active council profile.                                                       | The location remains visible; the response explains it cannot be routed; no council request occurs; correction and exit are available. |
| Provider unavailable        | Make the authority lookup time out or return malformed data.                                                                        | The location remains visible; temporary-unavailable guidance, retry, and exit are available; no council request occurs.                |
| Out-of-area target response | Route to a profile whose council target returns out-of-area.                                                                        | The resident is not told the report was submitted and is returned to location resolution.                                              |
| Data minimization           | Inspect the authority-lookup mock request.                                                                                          | It contains latitude and longitude only—no description, session data, report reference, or accuracy.                                   |
| No-JavaScript flow          | Repeat routing, recovery, and submission scenarios with JavaScript disabled.                                                        | Each flow works through ordinary browser navigation and forms.                                                                         |

## Profile-catalogue validation

For each active profile, run its compatibility fixture set. Verify its authority identifier,
category mapping, nearby-report filtering, accepted submission, out-of-area failure, and ambiguous
submission classification. A profile that fails any check must be disabled before deployment.

## Expected test coverage

- Unit tests: profile validation and matching, routing-result classification, council-aware nearby
  filtering, report-draft state reset, and council-aware target outcome messages.
- Integration tests: geographic authority adapter data minimization and failure mapping; profile-aware
  Love Clean Streets nearby/submission requests.
- Contract tests: page and JSON routing outcomes, no cross-council calls, and safe recovery statuses.
- End-to-end tests: the JavaScript-enabled and disabled report journeys, including unsupported and
  unavailable authority resolution.
