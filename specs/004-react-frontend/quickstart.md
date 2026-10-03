# Quickstart: Validate React Frontend Migration

## Prerequisites

- Node.js 26.
- Existing backend dependencies and mock target dependencies.
- Frontend dependencies installed from the new `frontend/package.json`.
- A browser runtime for Playwright.

## Run locally

```bash
# Terminal 1: mock target
npm --prefix backend run dev:mock-target

# Terminal 2: backend
FRONTEND_ORIGIN=http://127.0.0.1:4000 \
TARGET_BASE_URL=http://127.0.0.1:3001 \
NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 \
npm --prefix backend run dev

# Terminal 3: React frontend
npm --prefix frontend run dev
```

## Validation scenarios

1. Complete the no-match report flow and verify the confirmation reference.
2. Verify matching nearby report stops the flow without calling report submission.
3. Verify no-results and unavailable/retry nearby paths.
4. Verify denied and stale location behavior.
5. Cancel and refresh before confirmation; verify no prior data returns.
6. Run backend tests, React unit tests, frontend production build, and Playwright browser tests under
   Node.js 26.

**Expected result**: The React frontend provides all existing resident behavior without Jekyll/Ruby
commands or a second resident-facing frontend.

## Local validation record

- **2026-10-03**: Node.js 26 backend build/test/lint/format and React/Vite build/lint/format passed.
- **2026-10-03**: The full React frontend Playwright suite passed against the local backend and mock target.
