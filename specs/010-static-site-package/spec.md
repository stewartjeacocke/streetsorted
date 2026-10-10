# Feature Specification: Independently Deployable Static Site Package

**Feature Branch**: `010-static-site-package`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "refactor the build process so that the static site content is available as separate package that can be deployed independently of the node.js server"

## Clarifications

### Session 2026-10-10

- Q: How should links from the independently hosted static landing page reach dynamic server pages? → A: Use a public, configurable server base URL for dynamic links.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publish static site separately (Priority: P1)

As a release operator, I can produce the public static-site deliverable without producing or deploying
the application server so that static content can be hosted and released independently.

**Why this priority**: Independent publishing is the central outcome of this change and allows the
public site to use an appropriate static hosting release process.

**Independent Test**: Build the static-site deliverable in a clean workspace, publish its output to a
static host, and verify that the public landing page and its referenced assets are available without
starting the application server.

**Acceptance Scenarios**:

1. **Given** a source checkout with the required public site inputs, **When** a release operator
   creates the static-site package, **Then** the package contains the landing page and every asset it
   references as a self-contained deployable unit.
2. **Given** the application server is not built or running, **When** the static-site package is
   deployed to a static host, **Then** visitors can load the landing page and its styles and optional
   browser enhancements.
3. **Given** a static-site-only release is needed, **When** the operator runs the static-site release
   workflow, **Then** no server runtime artifact is required to publish that release.

---

### User Story 2 - Release server and static site independently (Priority: P2)

As a release operator, I can create and deploy a server release without republishing static-site
content, and can publish static-site updates without redeploying the server, so that each delivery
can match the scope of the change.

**Why this priority**: Separating delivery lifecycles reduces unnecessary releases and enables
independent operational ownership of static hosting.

**Independent Test**: Produce a server-only release and a static-site-only release in separate runs;
verify that each can be deployed without requiring a newly produced artifact from the other release.

**Acceptance Scenarios**:

1. **Given** a server-only change, **When** a server release is produced, **Then** it can be deployed
   without creating or publishing a replacement static-site package.
2. **Given** a static-content-only change, **When** a static-site release is produced, **Then** it can
   be deployed without creating or deploying a replacement server release.
3. **Given** release artifacts from the same source revision, **When** operators inspect them, **Then**
   the static-site and server deliverables are clearly distinguishable and independently usable.

---

### User Story 3 - Preserve the public landing experience (Priority: P3)

As a visitor, I can use the static landing page after the delivery refactor so that separating its
release does not change the information or navigation available to me.

**Why this priority**: The delivery change must not regress the established public experience.

**Independent Test**: Compare a deployed static package with the current landing experience using a
browser with scripts enabled and disabled; verify that expected content, links, styling, and ordinary
navigation remain available.

**Acceptance Scenarios**:

1. **Given** a visitor loads the deployed static landing page with JavaScript disabled, **When** the
   page finishes loading, **Then** all essential content and ordinary navigation links are usable.
2. **Given** a visitor loads the deployed static landing page with JavaScript enabled, **When** optional
   enhancements load, **Then** they do not prevent access to the page's essential content or links.
3. **Given** the static site lists supported councils or destinations, **When** it is published,
   **Then** only public information intended for visitors is included.
4. **Given** the static site and application server are deployed to different origins, **When** a
   visitor follows a landing-page link to a dynamic server page, **Then** the link uses the configured
   public server base URL and reaches the intended server destination.

### Edge Cases

- What happens when the static-site build cannot obtain a value needed to render public content? The
  build must fail with a clear diagnostic and must not publish a partial or misleading package.
- What happens when an asset referenced by the landing page is absent? Package creation must fail
  before a deployable artifact is made available.
- How does the release process handle a server-specific configuration value or secret? It must exclude
  it from the static-site package and report any attempt to expose it.
- What happens when the static site is published while a linked server endpoint is temporarily
  unavailable? The landing page and its normal navigation remain available; the linked destination
  handles its own availability state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build process MUST produce a standalone static-site package containing the public
  landing page and all public assets required for that page to render and function.
- **FR-002**: The static-site package MUST be deployable to a static host without running, deploying,
  or including the application server.
- **FR-003**: The build process MUST allow a static-site package to be produced independently from a
  server release artifact.
- **FR-004**: The build process MUST allow a server release artifact to be produced independently from
  a static-site package.
- **FR-005**: The static-site package MUST preserve the current public landing page's essential
  content, public destination links, styling, and ordinary document navigation.
- **FR-006**: Essential landing-page content and navigation MUST remain usable when browser JavaScript
  is unavailable.
- **FR-007**: The static-site package MUST contain only public information and MUST NOT include
  secrets, private credentials, server-only configuration, or server implementation artifacts.
- **FR-008**: Package creation MUST fail before publication when required public content or referenced
  assets cannot be assembled correctly.
- **FR-009**: Release documentation MUST state how to create, identify, and deploy the server and
  static-site artifacts independently.
- **FR-010**: The static-site and server deliverables MUST be identifiable as separate outputs from a
  given source revision.
- **FR-011**: Links from the static landing page to dynamic server pages MUST use a public,
  configurable server base URL so they remain valid when the static site and server are deployed to
  different origins; the configured URL MUST NOT contain confidential values.

### Key Entities *(include if feature involves data)*

- **Static-site package**: The self-contained public landing page and its public assets, prepared for
  deployment to static hosting.
- **Server release artifact**: The deployable application-server output that provides dynamic report
  functionality and is released independently from the static-site package.
- **Release artifact**: A versioned output associated with a source revision and identified as either
  a static-site or server deliverable.
- **Public site configuration**: Visitor-safe content required to render public static pages; it
  includes the configurable server base URL used for links to dynamic server pages and excludes all
  confidential and server-only values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested static-site-only releases, operators can publish the landing page to a
  static host without starting, deploying, or packaging the application server.
- **SC-002**: In 100% of tested server-only releases, operators can deploy the server artifact without
  producing or publishing a new static-site package.
- **SC-003**: In a clean release environment, a static-site package passes all package-integrity checks
  before it is made available for deployment, including checks for required files and prohibited
  confidential content.
- **SC-004**: In browser tests with JavaScript disabled, 100% of tested landing-page essential content
  and navigation links remain available from the independently deployed static site.
- **SC-005**: In release-operator validation, 100% of testers can identify the correct artifact and
  complete the documented deployment procedure for both the static site and server without relying on
  undocumented steps.
- **SC-006**: A static-content-only change can be published without a server deployment, and a
  server-only change can be deployed without a static-site publication, in each of at least two
  representative release rehearsals.

## Assumptions

- The existing public landing page is the static content in scope; dynamic report forms, APIs,
  sessions, submissions, and other server-rendered report pages remain part of the server release.
- Static-site hosting can serve ordinary HTML, stylesheets, scripts, and other public assets, but does
  not need to execute server-side report functionality.
- Public council names and public destination links required by the landing page are safe to include in
  the static-site package; credentials and server-only configuration are not.
- The static-site package is an independently deployable release artifact, not a new runtime service.
  Its separate lifecycle is justified by independent static-hosting ownership and release cadence,
  while the application remains a single server deployable for dynamic functionality.
- This delivery refactor does not introduce a single-page application, client-side routing, user
  accounts, or changes to the current reporting journey.
