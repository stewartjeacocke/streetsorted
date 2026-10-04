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
