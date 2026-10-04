# Quickstart: Validate the Handlebars Report-View Refactor

## Prerequisites

- Node.js 26.x, matching `package.json`.
- Project dependencies installed with `npm install`.
- Browser dependencies available for Playwright (`npx playwright install` if the test browser is absent).

## Validation sequence

1. Run static checks and server tests:

   ```sh
   npm run format
   npm run lint
   npm run test:server
   ```

   Expected: formatting and lint checks pass, and unit/contract coverage confirms the HTML layout, escaped
   values, all forms, recovery responses, and unchanged report-flow behavior.

2. Run the progressive-enhancement browser suite:

   ```sh
   npm run test:e2e
   ```

   Expected: the successful report, duplicate-match exit, validation/recovery, nearby retry, and submission
   retry journeys work; JavaScript-disabled tests pass; the location helper remains optional.

3. Build the production artifact and verify runtime assets are included:

   ```sh
   npm run build
   ```

   Expected: TypeScript compilation and asset copying succeed, and the distribution includes server runtime
   templates alongside compiled view modules without exposing templates as public static files.

## Manual smoke test

1. Start the mock target in one terminal:

   ```sh
   npm run dev:mock-target
   ```

2. Start the reporting app in another terminal:

   ```sh
   TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm run dev
   ```

3. Open `/report`, then complete a normal report with a valid latitude/longitude and description.
4. Check the rendered page source contains the shared document structure and expected forms, but no SPA root
   or client route script.
5. Submit text such as `<script>alert(1)</script>` in a safe test field/error fixture and confirm it is
   displayed literally, not interpreted as markup.

See [data-model.md](data-model.md) for page contexts and
[contracts/report-pages.md](contracts/report-pages.md) for the stable HTML/form contract.
