# Quickstart: Validate Postcode Location Input

## Prerequisites

- Node.js version matching `package.json` (`>=26 <27`).
- Dependencies installed with `npm install` after the feature adds `node-postcodes.io`.
- A reachable configured council-routing service for manual end-to-end checks, or the existing mock
  target/test fixtures for automated tests.

## Automated validation

Run these commands from the repository root:

```bash
npm run lint
npm run format
npm run build
npm test
npm run test:e2e
```

The implementation is ready when these checks cover the data model and contract scenarios below.

## Contract scenarios

Refer to [report-location.md](./contracts/report-location.md) and
[data-model.md](./data-model.md) for request fields, responses, and lifecycle rules.

1. **Manual valid postcode, without JavaScript**
   - Open `/report` with JavaScript disabled.
   - Confirm the page has one postcode field and no latitude/longitude inputs.
   - Submit a full supported postcode such as the test fixture's postcode.
   - Expected: a 303 redirect reaches the existing nearby or details stage, and subsequent resident
     pages display the canonical postcode only.

2. **Formatting normalization**
   - Submit the same supported postcode in lowercase and with extra spaces.
   - Expected: it resolves successfully and later display uses one canonical full-postcode form.

3. **Invalid and partial values**
   - Submit an empty value, malformed value, postcode district, and unlocatable full postcode.
   - Expected: the resident remains on the location page; an actionable message and the entered value
     are retained; no council or nearby lookup occurs for invalid/partial values.

4. **Unsupported council and temporary provider failure**
   - Stub the postcode adapter and council router for unsupported and unavailable outcomes.
   - Expected: unsupported coverage requests correction; unavailable provider requests retry; both
     retain the submitted postcode and do not advance the stage.

5. **Current-location suggestion**
   - With browser permission granted, stub reverse geocoding to return a canonical postcode.
   - Expected: the helper posts location data to the suggestion endpoint and fills an untouched blank
     field within 10 seconds.
   - Type a postcode before the response or edit the suggestion.
   - Expected: the helper does not overwrite typed input, and form submission uses the final typed
     incident postcode.

6. **Suggestion fallback and privacy**
   - Deny browser permission, simulate no geolocation support, return no reverse-geocode result, and
     simulate a suggestion-provider outage.
   - Expected: manual full-postcode entry remains usable in every case.
   - Inspect request paths, session state, browser storage, and captured logs.
   - Expected: no latitude, longitude, or postcode appears in URLs, browser storage, or logs; temporary
     draft data is cleared after cancellation, completion, and expiry.
