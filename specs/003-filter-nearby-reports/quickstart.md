# Quickstart: Validate Nearby Report Filtering

## Prerequisites

- Existing Node.js 24 backend dependencies and local mock target.
- Existing Jekyll frontend and browser-test setup.

## Validation scenarios

### 1. Mixed nearby reports

1. Configure the mock target with an active fly-tipping report, a closed fly-tipping report, and an
   active non-fly-tipping report.
2. Run a nearby lookup.

**Expected result**: Only the active fly-tipping report is returned and displayed.

### 2. All reports filtered out

1. Configure the mock target with only closed fly-tipping reports or non-fly-tipping reports.
2. Run a nearby lookup.

**Expected result**: The backend returns `no-results`; the existing frontend no-results flow permits
the resident to continue without a duplicate-match question.

### 3. Incomplete classifications

1. Configure target records with missing/blank category or completion fields.
2. Run a nearby lookup.

**Expected result**: The records are omitted and their fields do not appear in API responses or logs.
A blank or unfamiliar status label alone does not exclude a report whose category and completion
state qualify it.

### 4. Regression validation

Run backend build, unit/contract/integration tests, Jekyll build, and the existing Playwright suite.

**Expected result**: Existing report submission, nearby duplicate decision, no-results, retry, and
cancellation behavior remain unchanged.

## Local validation record

- **2026-10-03**: Backend build, unit, contract, adapter integration, lint, and formatting checks
  passed under Node.js 24.
- **2026-10-03**: Jekyll build and browser regression tests passed against the local mock target;
  no live council lookup or report submission was automated.
