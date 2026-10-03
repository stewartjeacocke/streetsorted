# Street Sorted

Requires Node.js 26.

```bash
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run dev:mock-target
FRONTEND_ORIGIN=http://127.0.0.1:4000 TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm --prefix backend run dev
npm --prefix frontend run dev
```

Run browser validation with `npm run test:e2e`.
