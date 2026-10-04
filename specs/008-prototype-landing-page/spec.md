# Feature Specification: Prototype Landing Page

**Feature Branch**: `008-prototype-landing-page`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "create a landing page that introduces this prototype"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understand the prototype and start reporting (Priority: P1)

As a resident visiting Street Sorted for the first time, I can read a clear introduction to the
prototype and start the fly-tipping reporting journey so that I understand its purpose and can take
the primary action without needing prior context.

**Why this priority**: A clear entry point is required for residents to discover the prototype and
begin its core reporting journey.

**Independent Test**: Open the service's root address and verify that a visitor can understand the
prototype's purpose, identify the primary action, and use it to reach the first report step.

**Acceptance Scenarios**:

1. **Given** a visitor opens the service's root address, **When** the landing page loads, **Then** it
   identifies Street Sorted as a fly-tipping reporting prototype and explains its resident-facing
   purpose in plain language.
2. **Given** a visitor is on the landing page, **When** they choose the primary call to action,
   **Then** they arrive at the first step of the existing report journey.
3. **Given** JavaScript is unavailable, **When** a visitor opens the landing page and chooses the
   primary call to action, **Then** they can still reach and begin the report journey using ordinary
   browser navigation.

---

### User Story 2 - Know what to expect before beginning (Priority: P2)

As a resident considering a report, I can see the main stages and information needed to use the
prototype so that I can decide whether to begin and prepare to complete the journey.

**Why this priority**: Setting expectations reduces uncertainty and helps residents complete the
multi-step journey successfully.

**Independent Test**: Review the landing page without starting a report and verify that it states the
high-level reporting steps and tells the visitor that they will need a location and a description of
the issue.

**Acceptance Scenarios**:

1. **Given** a visitor is deciding whether to begin, **When** they review the landing page, **Then**
   they see a concise, ordered explanation of locating the issue, checking for nearby reports, and
   providing report details.
2. **Given** a visitor reviews the landing page, **When** they look for preparation guidance,
   **Then** they are told that the journey asks for an issue location and a description.
3. **Given** a visitor reads the introduction, **When** they encounter a description of the service,
   **Then** the wording makes clear that it is a prototype rather than a live public-service promise.

---

### User Story 3 - Re-enter the reporting journey (Priority: P3)

As a returning visitor, I can use the landing page to restart a report so that I have a predictable
way to begin again after leaving or completing a previous journey.

**Why this priority**: A stable entry point supports recovery and repeat use without adding separate
account or history features.

**Independent Test**: Visit the landing page after starting, cancelling, or completing a report and
verify that its primary call to action starts the report journey according to the existing journey
rules.

**Acceptance Scenarios**:

1. **Given** a visitor returns to the landing page after a prior reporting attempt, **When** they
   choose the primary call to action, **Then** they are taken to the report entry point and receive
   the existing journey's appropriate starting state.

### Edge Cases

- A visitor opens the root address directly, refreshes it, or follows an external link; the same
  introduction and report-start action remain available.
- JavaScript, optional browser location access, or page styling is unavailable; the introduction and
  report-start action remain understandable and usable.
- A visitor does not have a precise location or description yet; the landing page explains what will
  be requested without preventing them from choosing to start.
- The report journey is temporarily unavailable after the visitor selects the call to action; the
  existing journey presents its established recovery guidance without the landing page making a false
  submission claim.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a landing page at the service's root address.
- **FR-002**: The landing page MUST identify Street Sorted and state that it is a prototype for
  reporting fly-tipping.
- **FR-003**: The landing page MUST explain, in plain language, that residents can report an issue,
  check whether a nearby report already matches it, and submit relevant details when needed.
- **FR-004**: The landing page MUST state that beginning a report requires the resident to provide an
  issue location and a description.
- **FR-005**: The landing page MUST provide one clearly distinguished primary action that takes a
  visitor to the first step of the existing report journey.
- **FR-006**: The landing page MUST make the primary action usable with standard browser navigation
  when JavaScript is unavailable.
- **FR-007**: The landing page MUST be understandable when displayed without optional styling or
  browser location access.
- **FR-008**: The landing page MUST not imply that the prototype is a live council service, guarantee
  a response, or claim that a report has been submitted before the existing report journey confirms
  it.
- **FR-009**: The landing page MUST present its introduction, expectation-setting content, and
  primary action in a readable order for visitors using assistive technology or keyboard navigation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In usability testing, at least 90% of first-time visitors can correctly identify the
  prototype's purpose and primary action within 30 seconds of opening the landing page.
- **SC-002**: At least 95% of participants can begin the report journey from the landing page on
  their first attempt without assistance.
- **SC-003**: At least 85% of participants can name both the location and description as information
  they expect to provide before starting a report.
- **SC-004**: All acceptance scenarios for reaching and using the landing page pass with JavaScript
  disabled.
- **SC-005**: In a review by keyboard-only and assistive-technology users, the page's introduction
  and primary action can be reached and understood without encountering a blocking navigation issue.

## Assumptions

- Street Sorted's existing fly-tipping report journey remains the prototype's only reporting flow.
- The existing report entry point continues to establish any report state required for the journey.
- The landing page is an informational entry point and does not introduce resident accounts, report
  history, status tracking, new report categories, or changes to report-submission rules.
- The prototype is intended for English-reading residents using standard desktop or mobile browsers.
- The landing page uses the service's established presentation conventions.
