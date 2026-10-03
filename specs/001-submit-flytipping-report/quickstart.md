# Quickstart: Validate Fly-tipping Report Submission

## Purpose

Validate the resident journey and the adapter boundary without submitting test reports to the live
Islington service. See [data-model.md](data-model.md) and
[contracts/report-submission.md](contracts/report-submission.md) for expected state and interface
behavior.

## Prerequisites

- Node.js 24 LTS.
- Ruby 3.3 and Bundler for the Jekyll frontend.
- Node.js 24 LTS for the backend and browser-test tooling.
- Dependencies installed from both future `frontend/` and `backend/` projects.
- The backend configured with the local mock target service and the Jekyll development origin.
- Browser location permission available for the test browser.

## Run locally

```bash
# Terminal 1: backend service
cd backend
npm install
npm run dev

# Terminal 2: Jekyll frontend site
cd frontend
bundle install
bundle exec jekyll serve
```

In separate terminals, run the test suites:

```bash
cd backend
npm test
npm run test:contract

# Browser tests run against the built Jekyll site and mock backend target
cd backend
npm run test:e2e
```

## Validation scenarios

### 1. Anonymous happy path

1. Start a new browser session and grant location permission.
2. Confirm the category is fixed to fly-tipping, backend requests use hard-coded target category ID
   `16144`, and no category picker or photo control is shown.
3. Enter a valid description and proceed to review.
4. Confirm the displayed location, description, and explicit final-confirmation control.
5. Confirm submission.

**Expected result**: The mock reports a successful target submission; the application displays
`confirmed` and the mock reference. No account sign-in is required.

### 2. Location permission denied or unavailable

1. Deny browser location permission or configure location detection to fail.
2. Try to continue.
3. Choose retry and grant permission on the next attempt.

**Expected result**: The application explains that location access is required, does not send a
submission request while unavailable, and reaches the description/review flow only after a location
is obtained.

### 3. Cancellation and retention

1. Grant location, enter a description, then cancel before final confirmation.
2. Start a new session.

**Expected result**: No request is sent to the mock target; the new session contains no prior
description or location data.

### 4. Target validation failure

1. Configure the mock target to reject the description or category.
2. Confirm submission.

**Expected result**: The application returns `failed` with a safe corrective message; it does not
claim submission succeeded.

### 5. Ambiguous target outcome

1. Configure the mock target to close the connection or return an unrecognizable confirmation page
   after receiving the final request.
2. Confirm submission.

**Expected result**: The application returns `unconfirmed`, permits a retry, and never shows a
success reference.

## Local validation record

- **2026-10-03**: Backend build, lint, unit tests, contract tests, and mock-target adapter
  integration tests passed under Node.js 24.
- **2026-10-03**: Jekyll build passed under Ruby 3.3, and all five Playwright scenarios passed
  against the local Jekyll site, Node.js backend, and mock target service.
- **2026-10-03**: No request was sent to the live council service during automated validation.

## Manual release check

Before release, a maintainer authorized to use the target service MUST manually verify the anonymous
flow against the live service without creating an unwanted report. Confirm that the target still
supports anonymous entry, hard-coded category ID `16144` still represents standard “Dumped or
flytipped waste,” location fields are accepted, and the confirmation parser recognizes the live
success outcome. Do not automate this check against the live civic service.
