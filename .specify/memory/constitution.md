<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: Secret protection → I. Secret Protection; Do not distribute by default →
  II. Single Deployable by Default
- Added sections: III. Progressive Enhancement, Not SPAs; Architecture and Delivery Constraints;
  Development Workflow
- Removed sections: none
- Follow-up TODOs: none
-->
# Street Sorted Constitution

## Core Principles

### I. Secret Protection
Secrets, including bearer tokens, API keys, passwords, and private credentials, MUST NOT be
committed to version control, embedded in client-delivered assets, or printed in logs. Secrets MUST
be supplied through approved runtime configuration or secret-management mechanisms.

Rationale: leaked credentials compromise users and systems regardless of how quickly a fix is
released.

### II. Single Deployable by Default
Vertical scaling and a single deployable are the default architecture. A new process, service, or
queue MUST have written justification tied to working-set overflow, geographic latency, or
organizational independence. Coordination costs, including network round trips and operational
ownership, MUST be considered before introducing distributed components.

Rationale: a simple deployment topology reduces operational risk and makes behavior easier to
understand and change.

### III. Progressive Enhancement, Not SPAs
Every user-facing web flow MUST work with server-rendered HTML and standard browser
forms when JavaScript is unavailable. JavaScript MAY enhance responsiveness and usability, but
MUST NOT be required to complete a user-facing flow. New web interfaces MUST use ordinary document
navigation and server-rendered pages; single-page applications and client-side-routing architectures
MUST NOT be created.

Rationale: a functional HTML baseline improves resilience, accessibility, interoperability, and
long-term maintainability.

## Development Workflow
Proposed work, reviews, and releases MUST assess compliance with the Core Principles and applicable
constraints. Changes to user-facing web flows MUST demonstrate that the flow remains usable without
JavaScript and does not introduce SPA-style client-side routing. Material configuration or tooling
changes require a compliance review; reviewers MUST record justified exceptions and follow-up
remediation. Documentation and implementation artifacts MUST be updated when this constitution
changes required behavior.

## Governance
This constitution supersedes conflicting project-level development practices. Amendments MUST be
documented in this file, include a Sync Impact Report during review, and receive maintainer approval
before adoption. The temporary Sync Impact Report MUST be removed before the amended constitution is
committed.

Constitution versions follow semantic versioning. Removing or redefining an existing governance
requirement requires a MAJOR version increase. Adding a principle or materially expanding a section
requires a MINOR version increase. Clarifications and non-semantic refinements require a PATCH
version increase.

Compliance review is required for every material configuration or tooling change. Maintainers MUST
ensure that proposed work and releases comply with this constitution. Any exception to a Core Principle requires written maintainer approval.

**Version**: 1.1.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-04
