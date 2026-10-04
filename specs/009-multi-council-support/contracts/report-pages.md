# Report Journey Contract

This contract extends the existing server-rendered `/report` journey. All mutations require the
existing report-session and CSRF protections. Responses remain usable with JavaScript disabled.

## Location routing

### `GET /report`

Creates or resumes a report draft and renders the location form. It does not contact a council or
the geographic authority provider.

### `POST /report/location`

Input: CSRF value, latitude, longitude.

| Result                       | HTTP behavior             | Resident-visible result                                                                                         |
| ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Invalid coordinate           | `400`                     | Render the location form with validation errors.                                                                |
| Assigned active council      | `303` to `/report/nearby` | Persist the coordinate and council assignment.                                                                  |
| Unsupported location         | `422`                     | Render the location form with the entered values, a non-routing explanation, and correction/exit actions.       |
| Authority lookup unavailable | `503`                     | Render the location form with entered values retained, temporary-unavailable guidance, retry, and exit actions. |

A corrected location replaces the prior location and clears its council assignment, description, and
nearby result before a new routing attempt.

## Existing journey steps with council assignment

### `GET /report/nearby`

Requires a fresh location and valid active council assignment. It uses only that profile's nearby
source and category mapping. Missing or invalid assignment produces the existing safe recovery
response and does not call an upstream service.

### `POST /report/nearby/decision`, `GET|POST /report/details`, `GET|POST /report/review`

These retain their current behavior but require the assigned active council throughout. Pages display
the identified council and provide an ordinary navigation path back to location correction before
confirmation.

### `POST /report/submit` and `POST /report/submit/retry`

Require the existing explicit confirmation, fresh location, CSRF token, and valid active council
assignment. Submission uses only the assigned profile's Love Clean Streets target and fly-tipping
category. An out-of-area response does not claim submission and directs the resident to start again
from location resolution.

## Existing JSON endpoints

`GET /api/nearby-reports` and `POST /api/reports` keep their existing request shapes. Before any
council-specific operation, they perform the same authority lookup and profile assignment from the
submitted coordinates. Unsupported and unavailable routing outcomes return a non-success outcome
without querying or submitting to a council. JSON outcome content must use the identified council
context and never use a hard-coded council name.
