# Street Sorted backend

Requires Node.js 24 LTS. Copy `.env.example` to `.env`, set `FRONTEND_ORIGIN` to the deployed Jekyll
site origin, and never log report text, coordinates, cookies, form tokens, or target HTML.

The Love Clean Streets category is intentionally fixed to `16144`. Before release, complete the
manual authorized compatibility check documented in the feature quickstart.

## Nearby-report duplicate check

The backend queries the configured nearby-report source with `approvedonly=false` and a 30-day
window. It returns only safe summaries and never logs or persists nearby-report lists, addresses,
descriptions, images, history, coordinates, or duplicate decisions.

## Nearby-report relevance filter

The nearby-report API returns only records with `CategoryId` `16144` and `Completed: false`.
`StatusName` remains display information and is not used to filter reports.
