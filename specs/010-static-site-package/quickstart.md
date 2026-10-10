# Quickstart Validation: Independently Deployable Static Site Package

## Prerequisites

- Node.js and dependencies installed with `npm ci`.
- A checked-out source revision.
- A public dynamic-server origin for the target environment, such as `https://reports.example.test`.
- `SOURCE_REVISION` identifying the release source revision.

Use only public values for static-site build configuration. Do not pass API keys, credentials, or server-only
configuration to the static-site command.

## Validate a static-site-only release

1. Start from a clean workspace and remove prior output: `rm -rf dist`.
2. Set `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION`.
3. Run `npm run build:static-site`.
4. Confirm `dist/static-site/` conforms to the [build artifact contract](contracts/build-artifacts.md):
   `index.html`, each referenced local asset, and `release.json` are present.
5. Inspect `release.json` and confirm `artifactType` is `static-site` and `sourceRevision` identifies the
   checked-out revision.
6. Serve `dist/static-site/` with any ordinary static file server. Do not start the Street Sorted Node.js
   application.
7. Load the landing page with JavaScript enabled and disabled. Confirm content, styles, council links, and
   the report-start link are available. Confirm the report-start link targets
   `<configured-server-base-url>/report`.
8. Inspect the artifact and confirm it contains no Handlebars templates, compiled server modules, `.env`
   files, credentials, or private server configuration.

Expected result: the static landing page is publishable without a server artifact or a running Node.js server.

## Validate a server-only release

1. Start from a clean workspace and remove prior output: `rm -rf dist`.
2. Set the `SOURCE_REVISION`.
3. Run `npm run build:server`.
4. Confirm `dist/server/release.json` identifies a `server` artifact for the selected source revision.
5. Start the server with its normal runtime configuration and verify `/health` plus the `/report` journey.
6. Confirm no `dist/static-site/` output was necessary to build or deploy the server.

Expected result: the dynamic reporting service works independently of a new static-site publication.

## Negative validation

- Omit or provide an invalid public server base URL: static-site build fails before a publishable artifact is
  left behind.
- Remove a referenced public asset: static-site build fails before publication.
- Introduce a credential-like value or server-only input into static-site output: the integrity check fails.
