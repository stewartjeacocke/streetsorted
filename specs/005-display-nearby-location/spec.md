# Feature Specification: Display Nearby Location

**Feature Branch**: `005-display-nearby-location`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "include detected location (as latitude and longitude) on the nearby reports page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the detected lookup location (Priority: P1)

A resident who reaches the nearby-reports step can see the detected latitude and longitude used to
find nearby reports, so they understand the location for which the duplicate check was performed.

**Why this priority**: The nearby-report decision depends on location; showing the detected values
makes the lookup context visible before the resident decides whether a listed report matches.

**Independent Test**: After location detection succeeds and the nearby-report step appears, a resident
can see both latitude and longitude values matching the current detected location.

**Acceptance Scenarios**:

1. **Given** a resident has granted location permission, **When** the nearby-report check begins,
   **Then** the nearby-reports page displays the detected latitude and longitude used for that check.
2. **Given** a resident refreshes the detected location, **When** the new nearby-report check begins,
   **Then** the displayed latitude and longitude update to the refreshed values.
3. **Given** location is unavailable, **When** the resident is shown location retry guidance,
   **Then** no stale latitude or longitude values are displayed as the current lookup location.

### Edge Cases

- The detected location includes more precision than the page can reasonably display: the page shows
  a consistent rounded representation while using the full detected values for the lookup.
- The resident cancels or resets the flow: the displayed location values are discarded with the
  transient draft.
- The nearby lookup is unavailable after location succeeds: the displayed latitude and longitude
  remain visible as the attempted lookup location while the resident retries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The nearby-reports page MUST display the latitude and longitude of the current detected
  location used for the nearby lookup.
- **FR-002**: The displayed values MUST update whenever the reporting flow obtains a refreshed
  location.
- **FR-003**: The page MUST use a consistent human-readable rounding format while preserving the full
  detected location values for the existing nearby lookup.
- **FR-004**: The page MUST NOT display a prior location after cancellation, reset, or a failed initial
  location attempt.
- **FR-005**: The latitude and longitude MUST remain transient in the frontend and MUST NOT be added
  to logs, browser storage, or new backend response fields.

### Key Entities *(include if feature involves data)*

- **Displayed lookup location**: The human-readable latitude and longitude shown on the nearby-reports
  page for the current detected location.
- **Detected location**: The existing transient location values used unchanged by the nearby lookup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested nearby-report flows with a detected location, the displayed latitude
  and longitude correspond to the location used for the lookup.
- **SC-002**: In 100% of tested location refreshes, the page replaces the prior displayed values with
  the refreshed location values before the next nearby result is shown.
- **SC-003**: In 100% of tested cancellation, reset, and denied-location flows, no obsolete location
  values remain displayed.
- **SC-004**: In 100% of tested nearby lookup requests, the request retains the full detected
  coordinates rather than the rounded display values.

## Assumptions

- The existing React frontend already holds detected location in transient report-flow state.
- The page displays latitude and longitude rounded to five decimal places for readability.
- This feature adds display context only; residents still cannot manually edit the detected location.
- Existing backend location redaction and no-persistence requirements remain unchanged.
