# Street Sorted

Street Sorted is a single Node.js 26 application. Its Express server exposes the report API and
serves a progressive-enhancement reporting journey at `/report`. Every report step is a
server-rendered HTML page with standard forms and ordinary browser navigation.

JavaScript is optional. The location page may use browser geolocation to fill the visible latitude
and longitude inputs, but manual entry and every reporting action work without scripts.

## Install

```bash
npm install
```

## Development

Start the single Express service:

```bash
npm run dev
```

The report pages, API, and health endpoint are available at `http://127.0.0.1:3000`.

### Multi-council routing

Council routing uses a server-side geographic authority provider. Set `AUTHORITY_LOOKUP_BASE_URL` and, if required, `AUTHORITY_LOOKUP_API_KEY` only in runtime configuration. Compatible councils are supplied through the public-only `COUNCIL_PROFILES` JSON catalogue; never place provider credentials in that catalogue.

### Local mock council target (optional)

To use the local mock council target instead of the configured upstream services, run these in
separate terminals:

```bash
# Terminal 1
npm run dev:mock-target

# Terminal 2
TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 AUTHORITY_LOOKUP_BASE_URL=http://127.0.0.1:3001 npm run dev
```

## Build and run

```bash
npm run build
npm start
```

## Validation

```bash
npm test
npm run lint
npm run test:e2e
```

## Independent release artifacts

Run `npm run build:static-site` with public `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION` to create `dist/static-site`; publish that directory to a static host. Run `npm run build:server` to create `dist/server` for the Node.js service. Both artifacts have `release.json` with `artifactType`; the static-site artifact always includes `sourceRevision`, while the server artifact includes it only when supplied to a direct build.

### Static-site deployment

1. Set `PUBLIC_SERVER_BASE_URL` to the public origin of the deployed Node.js reporting service and set
   `SOURCE_REVISION` to the revision being released.
2. Run `npm run build:static-site` and publish the contents of `dist/static-site/` to the chosen static
   host as ordinary files.
3. Before publishing, verify `dist/static-site/release.json` has `"artifactType": "static-site"` and the
   expected `sourceRevision`. Do not add credentials or server configuration to this directory.

### Server deployment

1. Provide normal server runtime configuration through the deployment environment. To optionally record
   a source revision in a direct build, set `SOURCE_REVISION` before running `npm run build:server`.
2. Run `npm run build:server`, or build the container with `docker build -t street-sorted .`.
3. Deploy `dist/server/` (or the built image) to the Node.js runtime, then verify `/health` and the
   `/report` flow. On `SIGTERM`, the production server stops accepting connections and drains active
   requests for up to 30 seconds before it terminates.
4. Verify `dist/server/release.json` has `"artifactType": "server"`. It has `sourceRevision` only for a
   direct build that supplied `SOURCE_REVISION`.

The artifacts can be released independently. A static-only change does not require a server deployment; a
server-only change does not require republishing the static site.
