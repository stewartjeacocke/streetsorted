<!--
Sync Impact Report
- Version change: unversioned template → 1.0.0
- Modified principles: none (initial adoption)
- Added sections: Core Principles; Security and Operational Constraints; Development Workflow;
  Governance
- Removed sections: none
- Follow-up TODOs: none
-->
# Street Sorted Constitution

## Core Principles

## Secret protection
Secrets (e.g. bearer tokens, API keys, passwords) MUST NOT be committed to 
version control or printed in logs.

## Do not distribute by default
Vertical scaling and a single deployable is the starting point. A new process,
service, or queue requires a written justification tied to one of: working-set
overflow, geographic latency, or organisational independence. 
Coordination is a cost measured in round trips.

## Governance
This constitution supersedes conflicting project-level development practices. All proposed work,
reviews, and releases MUST assess compliance with the Core Principles and applicable constraints.

Amendments MUST be documented in this file, include a Sync Impact Report during review, and receive
maintainer approval before adoption. The temporary Sync Impact Report MUST be removed before the
amended constitution is committed. An amendment that removes or redefines an existing governance
requirement requires a MAJOR version increase; adding a principle or materially expanding a section
requires a MINOR increase; clarifications and non-semantic refinements require a PATCH increase.

Compliance review is required for every material configuration or tooling change. Reviewers MUST
record justified exceptions and any follow-up remediation. Project documentation and implementation
artifacts MUST be updated when this constitution changes their required behavior.

**Version**: 1.0.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
