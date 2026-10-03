# Nearby Reports Service and UI Contract

## Frontend flow contract

1. After a valid location is available, the frontend requests nearby reports before showing the
   existing report-details step.
2. While lookup is `loading` or `unavailable`, the frontend MUST NOT enable new-report details,
   review, or submission.
3. For `reports-found`, the frontend renders every summary and asks exactly one resident-controlled
   question: whether any listed report matches the intended issue.
4. `match` discards all transient draft data, shows a stopped outcome, and MUST NOT call
   `POST /api/reports`.
5. `no-match` and `no-results` allow the existing report-details flow to continue.

## `GET /api/nearby-reports`

Retrieves safe nearby-report summaries for one browser-provided location.

**Query parameters**

| Name | Required | Rules |
|---|---|---|
| `latitude` | Yes | Number between -90 and 90. |
| `longitude` | Yes | Number between -180 and 180. |

**Success: reports found**

```json
{
  "state": "reports-found",
  "reports": [
    {
      "id": "external-report-id",
      "categoryName": "Dumped or flytipped waste",
      "recordedAt": "2026-10-03T12:00:00Z",
      "locationLabel": "Example street",
      "statusName": "Open",
      "description": "Approved target description"
    }
  ]
}
```

**Success: no reports**

```json
{
  "state": "no-results",
  "reports": []
}
```

**Failure**

```json
{
  "state": "unavailable",
  "residentMessage": "Nearby reports could not be retrieved. Please try again."
}
```

The endpoint accepts browser requests only from the configured Jekyll-site origin. It reads the target
with `approvedonly=false` and `days=30`, maps all returned reports to safe summaries, and MUST NOT
return raw coordinates, images, history, target HTML, target cookies, or unapproved descriptions.
