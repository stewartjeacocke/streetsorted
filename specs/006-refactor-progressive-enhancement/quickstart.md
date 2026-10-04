# Quickstart: Validate Progressive Enhancement Reporting

## Prerequisites

- Node.js version supported by the repository.
- Dependencies installed with `npm install`.

## Run locally

1. Start the local mock council target:

   ```bash
   npm run dev:mock-target
   ```

2. In another terminal, start Street Sorted against the mock target:

   ```bash
   TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm run dev
   ```

3. Open `/report` with JavaScript disabled. Follow the manual location form, inspect the nearby
   result, continue to details, review, and explicitly confirm a valid report. Confirm that the
   resulting page shows the expected resident-facing outcome.

## Validation scenarios

- Complete a valid report with JavaScript disabled. Verify normal page loads and form submissions at
  every step, with no reporting-page script required.
- With scripts enabled, use the location helper if available; verify it only fills the visible manual
  location inputs and the same standard form path completes the journey.
- Enter invalid coordinates and an empty/too-long description. Verify field-specific feedback and
  retained safe inputs on the returned HTML page.
- Exercise nearby results, no-results, unavailable lookup/retry, matching-report exit, cancellation,
  and retryable submission outcome paths.
- Refresh, navigate Back, and request an intermediate report URL with and without an active draft.
  Verify valid drafts recover appropriately and missing/expired drafts receive recovery guidance.
- Wait longer than five minutes before a state-changing request. Verify the draft is rejected/cleared
  and no report is submitted.
- Inspect responses and browser storage: report pages contain content and controls without a SPA shell
  or React runtime; report location and description are absent from URLs, browser storage, and client
  logs.

## Automated checks

```bash
npm test
npm run lint
npm run test:e2e
```

Use the browser-flow contract in [contracts/report-pages.md](contracts/report-pages.md) and the
lifecycle rules in [data-model.md](data-model.md) when adding or reviewing automated coverage.
