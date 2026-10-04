# Quickstart: Validate the Prototype Landing Page

## Prerequisites

- Node.js version supported by the repository.
- Dependencies installed with `npm install`.

## Build-time artifact validation

1. Run `npm run build`.
2. Inspect the generated public asset directory under `dist/server/public`.
3. Confirm that `index.html` exists and contains:
   - a complete HTML document;
   - the established Street Sorted heading and `.page` main container;
   - the shared `/report.css` stylesheet reference;
   - prototype-introduction content and an anchor to `/report`.
4. Confirm that no public `index.hbs` template or generated Handlebars JavaScript artifact exists.

## Development and browser validation

1. Run `npm run dev`.
2. Open `http://127.0.0.1:3000/`.
3. Verify that the page matches the existing report-page layout, calls Street Sorted a fly-tipping
   reporting prototype, states the location and description expectations, and describes the nearby
   report check.
4. Activate the primary action and verify that it navigates to `/report`, where the existing first
   report step is available.
5. Disable JavaScript in the browser, reload `/`, and repeat step 4. The landing link and report
   entry journey must still work.
6. Disable page styles or inspect the page without CSS. Confirm that the Street Sorted heading,
   prototype introduction, expectation-setting content, and `/report` action remain readable and in
   a useful order.
7. Use keyboard-only navigation to reload `/`, reach the primary action in reading order, and
   activate it. Confirm no keyboard-navigation step blocks access to the report-start action.

## Automated validation

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected results:

- Unit tests verify the build produces final HTML and keeps Handlebars sources private.
- Request-level tests verify `GET /` serves the documented landing-page contract when given the
  generated static assets.
- Existing report-page and browser tests continue to confirm the `/report` journey works without
  client-side routing or mandatory JavaScript.

See [data-model.md](data-model.md) for artifact lifecycle and
[contracts/landing-page.md](contracts/landing-page.md) for the public URL and document contract.
