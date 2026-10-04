# Street Sorted

Street Sorted is a single Node.js 26 application. Its Express server exposes the report API and
serves the built React application from the same origin.

## Install

```bash
npm install
```

## Development

Start the single Express service:

```bash
npm run dev
```

The application, API, and health endpoint are all available at `http://127.0.0.1:3000`. Client
assets rebuild automatically after a source change; refresh the browser to load the rebuilt assets.

### Local mock council target (optional)

To use the local mock council target instead of the configured upstream services, run these in
separate terminals:

```bash
# Terminal 1
npm run dev:mock-target

# Terminal 2
TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm run dev
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
