# Feature Specification: Postcode Location Input

**Feature Branch**: `011-postcode-location-input`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "the user should enter a postcode as their location not latitude and longitude. postcode should be prefilled with the closest match to their current location."

## Clarifications

### Session 2026-10-11

- Q: Should the postcode identify the fly-tipping incident’s location, rather than necessarily the resident’s current location? → A: Use the incident location; prefill from current location only as an editable suggestion.
- Q: Must residents enter a full UK postcode, such as “N1 9PF”, rather than a broader postcode district such as “N1”? → A: Require a full UK postcode; reject partial postcodes and postcode districts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter a report location by postcode (Priority: P1)

A resident starting a fly-tipping report enters the incident postcode instead of latitude and
longitude so that location entry uses a familiar, meaningful value.

**Why this priority**: Replacing coordinate entry is the core requested experience and enables
residents to start a report without knowing technical geographic values.

**Independent Test**: A resident can enter a valid postcode, submit the location step, and continue
to the existing report flow without ever viewing or entering latitude or longitude.

**Acceptance Scenarios**:

1. **Given** a resident starts a new report, **When** they open the location step, **Then** they see a
   single postcode field and do not see latitude or longitude fields.
2. **Given** a resident enters a valid, supported full postcode, **When** they submit the location
   step, **Then** the report flow uses that postcode's location for the existing council and
   nearby-report checks and advances to the appropriate next step.
3. **Given** a resident enters a postcode with lower-case letters or extra internal or surrounding
   spaces, **When** they submit it, **Then** it is accepted when it identifies a valid supported full
   postcode and is shown in a consistent standard form on subsequent report pages.
4. **Given** a resident enters only a postcode area or district, **When** they submit the location
   step, **Then** they remain on that step and receive a message to enter their full postcode.

---

### User Story 2 - Start with a nearby postcode suggestion (Priority: P2)

A resident who allows their browser to share their current location sees the postcode closest to that
location prefilled as an editable suggestion, so they can replace it with the incident postcode or
confirm it instead of typing it from scratch.

**Why this priority**: A useful default reduces effort while preserving the resident's control over
the incident location used for their report.

**Independent Test**: With a current location available and permission granted, opening the location
step pre-populates the postcode field with the closest matching postcode; the resident can submit it
or replace it before continuing.

**Acceptance Scenarios**:

1. **Given** a resident grants current-location permission and a closest postcode can be identified,
   **When** the location step is ready, **Then** the postcode field is prefilled with that postcode.
2. **Given** a suggested postcode is prefilled, **When** the resident changes it before submitting,
   **Then** the changed postcode, not the suggestion, is used as the incident location for the report.
3. **Given** a resident does not grant permission, their browser cannot provide a location, or no
   nearby postcode can be identified, **When** they view the location step, **Then** they can enter a
   postcode manually and can still complete the location step.

---

### User Story 3 - Correct an unusable postcode (Priority: P3)

A resident who provides an empty, malformed, unrecognised, or unsupported postcode receives clear
guidance and can correct it without losing their entered value.

**Why this priority**: Clear recovery prevents a failed lookup from becoming an abandoned report.

**Independent Test**: Submit each invalid postcode case and verify that the resident remains on the
location step, sees an understandable correction message, and retains the value they entered.

**Acceptance Scenarios**:

1. **Given** a resident submits no postcode or a malformed postcode, **When** validation occurs,
   **Then** they remain on the location step with a message explaining that a valid postcode is
   required.
2. **Given** a resident submits a validly formatted postcode that cannot be located or is outside a
   supported council area, **When** location processing occurs, **Then** they are told that the
   postcode cannot be used for this report and can enter a different postcode.
3. **Given** postcode lookup is temporarily unavailable, **When** a resident submits a postcode,
   **Then** they see a temporary-service message, retain their entered postcode, and can retry.

### Edge Cases

- A location-derived postcode suggestion arrives after the resident has started typing: it must not
overwrite the resident's entered or edited postcode.
- The browser supplies a location near a postcode boundary: the field shows the closest identifiable
postcode, and the resident can replace it before submitting.
- A postcode format is valid but resolves to more than one relevant geographic result: the flow uses
a deterministic closest/primary result or asks the resident to enter a more specific postcode; it
must not silently use an unrelated location.
- A resident refreshes or returns to the location step after an invalid submission: the latest entered
postcode and any applicable validation message remain available for correction.
- The resident cancels or starts a new report: the in-progress postcode and derived location are
discarded with the existing transient report draft.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The location step MUST request a postcode as the resident's location input and MUST NOT
  expose latitude or longitude fields to residents.
- **FR-002**: The postcode field MUST be usable with standard server-rendered form submission; a
  resident MUST be able to complete location entry when JavaScript, browser geolocation, or location
  permission is unavailable.
- **FR-003**: When the resident grants browser current-location permission and a closest matching
  postcode can be identified, the location step MUST prefill the postcode field with that suggestion.
- **FR-004**: A location-derived suggestion MUST remain editable, and the system MUST use the postcode
  present when the resident submits the form as the incident location rather than an earlier suggestion.
- **FR-005**: The system MUST require a full supported United Kingdom postcode and MUST reject a
  postcode area, district, or other partial postcode as insufficiently specific.
- **FR-006**: The system MUST accept a valid supported full postcode despite harmless casing and
  spacing differences, normalize it to a consistent display form, and use its resolved location for
  the existing council-routing and nearby-report checks.
- **FR-007**: The system MUST prevent progression when the submitted postcode is empty, partial,
  malformed, unlocatable, or outside a supported council area, and MUST provide a clear corrective
  message while retaining the submitted postcode.
- **FR-008**: When postcode resolution or council identification is temporarily unavailable, the
  system MUST keep the resident on the location step, preserve the submitted postcode, explain that
  the service is temporarily unavailable, and allow a retry.
- **FR-009**: The system MUST show the selected postcode, rather than latitude or longitude, wherever
  the reporting flow presents the incident location to the resident after location entry.
- **FR-010**: The reporting flow MUST continue using a location derived from the final submitted
  postcode as the incident location for existing downstream processing, without requiring residents
  to view or manually enter coordinates.
- **FR-011**: A postcode suggestion, submitted postcode, browser-provided location, and any location
  derived from it MUST remain limited to the existing in-progress report flow, must not be written to
  browser storage or logs, and must be discarded when the report is cancelled, completed, or expires.

### Key Entities *(include if feature involves data)*

- **Postcode input**: The editable, normalized postcode supplied or confirmed by the resident for
  the fly-tipping incident in an in-progress report.
- **Suggested postcode**: The closest postcode identified from the resident's permitted current
  browser location before form submission.
- **Resolved report location**: The geographic location obtained from the final submitted postcode and
  used by the existing council-routing, nearby-report, and submission processes.
- **Report draft**: The existing transient browser-associated report state that holds the postcode and
  resolved location only while the resident progresses through the report flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested new-report location pages, residents are offered a postcode field and
  are not shown latitude or longitude input fields.
- **SC-002**: At least 95% of tested residents with a valid supported full postcode complete the location
  step and reach the applicable next report step on their first submission.
- **SC-003**: In 100% of tested cases where current-location permission is granted and a closest
  postcode is available, the postcode field is populated within 10 seconds without preventing manual
  entry or editing.
- **SC-004**: In 100% of tested denied-permission, unavailable-location, and no-JavaScript cases,
  residents can manually enter a valid supported full postcode and continue the report flow.
- **SC-005**: In 100% of tested partial, invalid, unlocatable, unsupported, and temporarily unavailable
  postcode cases, residents receive an appropriate message and retain the value needed to correct or
  retry the location step.
- **SC-006**: In 100% of tested cancellation, completion, and expiry cases, the transient postcode and
  associated location are no longer available in the report flow.

## Assumptions

- The service accepts full United Kingdom postcodes only and supports reports only when they can be
  routed to its existing supported council areas.
- A postcode represents an adequate location for the fly-tipping incident in this feature; residents
  can edit a current-location suggestion before submission but are not asked to enter coordinates as a
  fallback.
- The closest postcode is suggested only after the resident has granted browser current-location
  permission; no automatic location access occurs without that permission.
- Existing council-routing, nearby-report checking, report submission, session expiry, and privacy
  safeguards remain in scope and use the location resolved from the final submitted postcode.
- The feature replaces coordinate presentation throughout the resident reporting flow; operational
  systems may retain only the location data already necessary to route and submit the report.
