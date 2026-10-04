# Street Sorted

Street Sorted is a single Node.js 26 application. Its Express server exposes the report API and,
in production, serves the built React application from the same origin.

## Install

```bash
npm install
```

## Development

Start the Vite client and local API together:

```bash
npm run dev
```

This starts the Vite client at `http://127.0.0.1:4000` and the Express API at
`http://127.0.0.1:3000`. Vite proxies `/api` requests to that local API. Production requests are
same-origin and use the server at port 3000.

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
