# Quickstart: Validate Nearby Report Check

## Prerequisites

- Ruby 3.3, Bundler, and the existing Jekyll frontend dependencies.
- Node.js 24 LTS and existing backend dependencies.
- Local mock target configured to return reports-found, no-results, and unavailable responses.

## Run locally

Use the existing frontend, backend, and mock-target development commands. Run the new nearby-report
contract, integration, and browser-flow tests together with the existing report-submission tests.

## Validation scenarios

### 1. Nearby reports found and match selected

1. Grant location permission.
2. Configure the mock target to return multiple nearby reports.
3. Confirm every returned safe summary appears.
4. Select that a report matches.

**Expected result**: The draft is discarded, the flow stops, and no submission request is made.

### 2. Nearby reports found and no match selected

1. Grant location permission.
2. Configure the mock target to return nearby reports.
3. Select that none match.

**Expected result**: The existing description/review/submission flow becomes available.

### 3. No nearby reports

1. Configure the mock target to return an empty list.
2. Grant location permission.

**Expected result**: The resident sees a no-results message and can continue without a match question.

### 4. Lookup unavailable

1. Configure the mock target to return an error or malformed response.
2. Grant location permission.

**Expected result**: The resident sees a retry action and cannot reach new-report submission until a
lookup returns reports or an empty result.

### 5. Data minimization

1. Configure the mock response with raw coordinates, image URLs, history, and an unapproved
   description.
2. Perform the lookup.

**Expected result**: Those fields do not appear in the frontend response or application logs.

## Local validation record

- **2026-10-03**: Backend build, unit, contract, adapter integration, lint, and formatting checks
  passed under Node.js 24.
- **2026-10-03**: Jekyll build and 12 browser scenarios, including nearby results, no results,
  unavailable/retry, stale-location refresh, matching stop, and cancellation, passed against the
  local mock target; no live council lookup or report submission was automated.
