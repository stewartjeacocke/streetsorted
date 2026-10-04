# Council Profile Catalogue Contract

## Purpose

The catalogue defines the currently supported Love Clean Streets councils. It is reviewed,
version-controlled deployment configuration in the existing application, not a resident-editable
resource or a separate service.

## Admission rules

A council profile may be activated only when all of the following are verified:

1. The geographic authority provider returns one of the profile's configured authority identifiers
   for a known in-area test coordinate.
2. The public anonymous Love Clean Streets session and report form are compatible with the existing
   reporting journey.
3. The council-specific fly-tipping category works for report submission and nearby filtering.
4. The nearby-report source returns data that can be safely filtered under the existing rules.
5. Accepted, out-of-area, rejected, and ambiguous target responses are classified safely and produce
   council-appropriate resident wording.

## Change rules

- Adding, changing, or disabling a profile requires the compatibility checks above.
- Duplicate active authority identifiers are invalid.
- A disabled or invalid profile is excluded from automatic routing immediately after deployment.
- Profiles contain public destinations and identifiers only. Provider credentials stay in runtime
  configuration and are never placed in the catalogue.

## Operational validation

The test suite supplies profile-specific mocks or fixtures for every active profile. A catalogue
change is accepted only when each active profile passes its routing, nearby-report, submission, and
failure-classification checks.
