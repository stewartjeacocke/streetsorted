# Nearby Report Filter Contract

The existing `GET /api/nearby-reports` response shape is unchanged.

## Backend filter rules

Before a target record can be mapped to a safe summary, the backend MUST require both of the following:

1. `CategoryId` equals `16144`.
2. `Completed` is the boolean value `false`.

A record failing either rule MUST NOT appear in the response. `StatusName` does not affect filtering. The backend preserves source order among
all qualifying records and does not cap or paginate them.

## Empty result

When no records qualify, return the existing empty-result contract:

```json
{
  "state": "no-results",
  "reports": []
}
```

The response MUST NOT disclose why individual target records were filtered out.
